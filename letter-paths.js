/**
 * AprendIDos — letter-paths.js
 * Módulo de traçados pedagógicos e avaliação multicritério de caligrafia.
 *
 * Este arquivo define:
 *  - LETTER_PATHS: traçados normalizados (0-1) para cada letra A-Z e acentuadas
 *  - WRITING_EVALUATION_CONFIG: todos os parâmetros ajustáveis em um só lugar
 *  - Funções de avaliação: coverage, spatial accuracy, out-of-bounds, order,
 *    direction, stroke length, stroke completion, evaluateLetter
 *  - Funções de demonstração: getScaledStrokesForLetter, runLetterDemo
 *
 * COMO AJUSTAR:
 *  - Altere WRITING_EVALUATION_CONFIG para mudar thresholds e pesos
 *  - Altere WRITING_DEBUG = true para ver métricas no console
 *  - Altere LETTER_PATHS para refinar o traçado de letras específicas
 */

// ============================================================
// DEBUG — true = exibe métricas detalhadas no console
// ============================================================
var WRITING_DEBUG = false;

// ============================================================
// CONFIGURAÇÃO CENTRAL
// Altere aqui para calibrar a avaliação sem procurar valores no código
// ============================================================
var WRITING_EVALUATION_CONFIG = {
    // Pontuação mínima composta (0-100) para aprovação
    minScore: 52,

    // Cobertura mínima do traçado esperado (0-100)
    minCoverage: 45,

    // Precisão espacial mínima: % de pontos do usuário próximos ao traçado (0-100)
    minSpatialAccuracy: 40,

    // Fração máxima de pontos fora do traçado (0-1) — acima disso penaliza
    maxOutsideRatio: 0.60,

    // Razão máxima comprimento_usuário / comprimento_esperado
    // acima disso = rabisco excessivo
    maxLengthRatio: 4.5,

    // Corredor de tolerância: multiplicador do fontSize da letra
    // Ex: fontSize 60 * 0.22 = ~13px de tolerância ao redor do traçado
    pathToleranceFactor: 0.22,

    // Pesos da pontuação composta (devem somar 1.0)
    weightCoverage:         0.32,
    weightSpatialAccuracy:  0.28,
    weightOrder:            0.18,
    weightDirection:        0.10,
    weightStrokeCompletion: 0.12,

    // Tolerância de ordem: quanto (0-1) do caminho o ponto pode regredir sem penalidade
    orderRegressionTolerance: 0.18,

    // Número mínimo de pontos para que um stroke seja considerado válido
    minPointsPerStroke: 3,

    // Distância mínima (px) entre pontos consecutivos do usuário (filtra ruído)
    sampleMinDistance: 4,

    // Bônus de tolerância por tentativa adicional (multiplicador)
    // A cada tentativa falha, tolerância cresce por esse fator (máx maxAttemptBonus)
    attemptToleranceBonus: 0.08,

    // Número máximo de tentativas em que o bônus de tolerância cresce
    maxAttemptBonus: 3
};

// ============================================================
// LETTER_PATHS — traçados normalizados (x: 0-1, y: 0-1)
// Origem (0,0) = canto superior esquerdo da bounding box da letra
// (1,1) = canto inferior direito
// Cada letra tem um array de "strokes".
// Cada stroke é um array de pontos {x, y} normalizados.
// A ordem e direção representam como a letra deve ser traçada.
// ============================================================
var LETTER_PATHS = {
    'A': {
        strokes: [
            // Diagonal esquerda: base esquerda até o topo
            [{x:0.10,y:1.00},{x:0.30,y:0.65},{x:0.50,y:0.05}],
            // Diagonal direita: topo até a base direita
            [{x:0.50,y:0.05},{x:0.70,y:0.65},{x:0.90,y:1.00}],
            // Barra central
            [{x:0.25,y:0.62},{x:0.50,y:0.62},{x:0.75,y:0.62}]
        ]
    },
    'B': {
        strokes: [
            // Haste vertical
            [{x:0.22,y:0.05},{x:0.22,y:1.00}],
            // Barriga superior
            [{x:0.22,y:0.05},{x:0.60,y:0.08},{x:0.78,y:0.22},{x:0.75,y:0.40},{x:0.58,y:0.50},{x:0.22,y:0.50}],
            // Barriga inferior
            [{x:0.22,y:0.50},{x:0.62,y:0.52},{x:0.82,y:0.67},{x:0.80,y:0.84},{x:0.62,y:0.97},{x:0.22,y:1.00}]
        ]
    },
    'C': {
        strokes: [
            // Arco aberto para a direita
            [{x:0.82,y:0.22},{x:0.65,y:0.06},{x:0.42,y:0.02},{x:0.20,y:0.15},
             {x:0.08,y:0.38},{x:0.08,y:0.62},{x:0.20,y:0.85},{x:0.42,y:0.98},
             {x:0.65,y:0.96},{x:0.82,y:0.82}]
        ]
    },
    'D': {
        strokes: [
            // Haste vertical
            [{x:0.22,y:0.05},{x:0.22,y:1.00}],
            // Arco fechado à direita
            [{x:0.22,y:0.05},{x:0.55,y:0.07},{x:0.80,y:0.22},{x:0.90,y:0.50},
             {x:0.80,y:0.78},{x:0.55,y:0.95},{x:0.22,y:1.00}]
        ]
    },
    'E': {
        strokes: [
            // Contorno esquerdo + base + topo (sem a barra central)
            [{x:0.75,y:0.05},{x:0.22,y:0.05},{x:0.22,y:1.00},{x:0.75,y:1.00}],
            // Barra central
            [{x:0.22,y:0.52},{x:0.65,y:0.52}]
        ]
    },
    'F': {
        strokes: [
            // Topo + haste vertical
            [{x:0.75,y:0.05},{x:0.22,y:0.05},{x:0.22,y:1.00}],
            // Barra central
            [{x:0.22,y:0.52},{x:0.65,y:0.52}]
        ]
    },
    'G': {
        strokes: [
            // Arco tipo C com entrada horizontal
            [{x:0.82,y:0.22},{x:0.65,y:0.06},{x:0.42,y:0.02},{x:0.20,y:0.15},
             {x:0.08,y:0.38},{x:0.08,y:0.62},{x:0.20,y:0.85},{x:0.42,y:0.98},
             {x:0.65,y:0.96},{x:0.85,y:0.82},{x:0.85,y:0.55},{x:0.52,y:0.55}]
        ]
    },
    'H': {
        strokes: [
            // Haste esquerda
            [{x:0.20,y:0.05},{x:0.20,y:1.00}],
            // Haste direita
            [{x:0.80,y:0.05},{x:0.80,y:1.00}],
            // Barra central
            [{x:0.20,y:0.52},{x:0.80,y:0.52}]
        ]
    },
    'I': {
        strokes: [
            // Haste vertical simples
            [{x:0.50,y:0.05},{x:0.50,y:1.00}]
        ]
    },
    'J': {
        strokes: [
            // Haste vertical com gancho esquerdo embaixo
            [{x:0.60,y:0.05},{x:0.60,y:0.75},{x:0.50,y:0.92},
             {x:0.35,y:0.98},{x:0.22,y:0.90},{x:0.18,y:0.78}]
        ]
    },
    'K': {
        strokes: [
            // Haste vertical
            [{x:0.22,y:0.05},{x:0.22,y:1.00}],
            // Braço superior diagonal: topo direita até o meio da haste
            [{x:0.80,y:0.05},{x:0.55,y:0.45},{x:0.22,y:0.52}],
            // Braço inferior diagonal: do meio até base direita
            [{x:0.22,y:0.52},{x:0.55,y:0.60},{x:0.80,y:1.00}]
        ]
    },
    'L': {
        strokes: [
            // Haste vertical + base horizontal
            [{x:0.22,y:0.05},{x:0.22,y:1.00},{x:0.78,y:1.00}]
        ]
    },
    'M': {
        strokes: [
            // Haste esq + diagonal ao centro + diagonal ao topo + haste dir
            [{x:0.10,y:1.00},{x:0.10,y:0.05},{x:0.50,y:0.60},{x:0.90,y:0.05},{x:0.90,y:1.00}]
        ]
    },
    'N': {
        strokes: [
            // Haste esq + diagonal + haste dir (traçado contínuo)
            [{x:0.15,y:1.00},{x:0.15,y:0.05},{x:0.85,y:1.00},{x:0.85,y:0.05}]
        ]
    },
    'O': {
        strokes: [
            // Elipse fechada (sentido horário, começando do topo)
            [{x:0.50,y:0.02},{x:0.78,y:0.08},{x:0.95,y:0.30},{x:0.95,y:0.50},
             {x:0.95,y:0.70},{x:0.78,y:0.92},{x:0.50,y:0.98},{x:0.22,y:0.92},
             {x:0.05,y:0.70},{x:0.05,y:0.50},{x:0.05,y:0.30},{x:0.22,y:0.08},
             {x:0.50,y:0.02}]
        ]
    },
    'P': {
        strokes: [
            // Haste vertical
            [{x:0.22,y:0.05},{x:0.22,y:1.00}],
            // Barriga superior
            [{x:0.22,y:0.05},{x:0.60,y:0.07},{x:0.80,y:0.22},
             {x:0.78,y:0.40},{x:0.58,y:0.52},{x:0.22,y:0.52}]
        ]
    },
    'Q': {
        strokes: [
            // Elipse (igual ao O)
            [{x:0.50,y:0.02},{x:0.78,y:0.08},{x:0.95,y:0.30},{x:0.95,y:0.50},
             {x:0.95,y:0.68},{x:0.78,y:0.90},{x:0.50,y:0.98},{x:0.22,y:0.90},
             {x:0.05,y:0.68},{x:0.05,y:0.50},{x:0.05,y:0.30},{x:0.22,y:0.08},
             {x:0.50,y:0.02}],
            // Perninha diagonal embaixo-direita
            [{x:0.62,y:0.75},{x:0.78,y:0.92},{x:0.90,y:1.00}]
        ]
    },
    'R': {
        strokes: [
            // Haste vertical
            [{x:0.22,y:0.05},{x:0.22,y:1.00}],
            // Barriga superior
            [{x:0.22,y:0.05},{x:0.60,y:0.07},{x:0.80,y:0.22},
             {x:0.78,y:0.40},{x:0.58,y:0.52},{x:0.22,y:0.52}],
            // Perna diagonal
            [{x:0.45,y:0.52},{x:0.62,y:0.70},{x:0.82,y:1.00}]
        ]
    },
    'S': {
        strokes: [
            // Curva dupla (cobrinha)
            [{x:0.80,y:0.18},{x:0.65,y:0.05},{x:0.42,y:0.03},{x:0.22,y:0.15},
             {x:0.18,y:0.32},{x:0.30,y:0.47},{x:0.52,y:0.52},{x:0.72,y:0.58},
             {x:0.82,y:0.72},{x:0.78,y:0.88},{x:0.58,y:0.97},{x:0.38,y:0.97},
             {x:0.20,y:0.85}]
        ]
    },
    'T': {
        strokes: [
            // Barra horizontal (topo completo)
            [{x:0.08,y:0.05},{x:0.50,y:0.05},{x:0.92,y:0.05}],
            // Haste vertical central
            [{x:0.50,y:0.05},{x:0.50,y:1.00}]
        ]
    },
    'U': {
        strokes: [
            // Haste esq + curva na base + haste dir
            [{x:0.18,y:0.05},{x:0.18,y:0.72},{x:0.25,y:0.88},{x:0.40,y:0.98},
             {x:0.50,y:1.00},{x:0.60,y:0.98},{x:0.75,y:0.88},{x:0.82,y:0.72},
             {x:0.82,y:0.05}]
        ]
    },
    'V': {
        strokes: [
            // Diagonal esq + diagonal dir
            [{x:0.10,y:0.05},{x:0.50,y:1.00},{x:0.90,y:0.05}]
        ]
    },
    'W': {
        strokes: [
            // Quatro diagonais contínuas
            [{x:0.05,y:0.05},{x:0.25,y:1.00},{x:0.50,y:0.55},{x:0.75,y:1.00},{x:0.95,y:0.05}]
        ]
    },
    'X': {
        strokes: [
            // Diagonal principal (topo-esq para base-dir)
            [{x:0.10,y:0.05},{x:0.90,y:1.00}],
            // Diagonal secundária (topo-dir para base-esq)
            [{x:0.90,y:0.05},{x:0.10,y:1.00}]
        ]
    },
    'Y': {
        strokes: [
            // Braço esquerdo ao centro
            [{x:0.10,y:0.05},{x:0.50,y:0.50}],
            // Braço direito ao centro
            [{x:0.90,y:0.05},{x:0.50,y:0.50}],
            // Haste central para baixo
            [{x:0.50,y:0.50},{x:0.50,y:1.00}]
        ]
    },
    'Z': {
        strokes: [
            // Barra superior + diagonal + barra inferior (contínuo)
            [{x:0.10,y:0.05},{x:0.90,y:0.05},{x:0.10,y:1.00},{x:0.90,y:1.00}]
        ]
    }
};

// Mapeamento de acentuadas para a letra base
var LETTER_BASE_MAP = {
    'A':'A','a':'A',
    'B':'B','b':'B',
    'C':'C','c':'C',
    'D':'D','d':'D',
    'E':'E','e':'E',
    'F':'F','f':'F',
    'G':'G','g':'G',
    'H':'H','h':'H',
    'I':'I','i':'I',
    'J':'J','j':'J',
    'K':'K','k':'K',
    'L':'L','l':'L',
    'M':'M','m':'M',
    'N':'N','n':'N',
    'O':'O','o':'O',
    'P':'P','p':'P',
    'Q':'Q','q':'Q',
    'R':'R','r':'R',
    'S':'S','s':'S',
    'T':'T','t':'T',
    'U':'U','u':'U',
    'V':'V','v':'V',
    'W':'W','w':'W',
    'X':'X','x':'X',
    'Y':'Y','y':'Y',
    'Z':'Z','z':'Z',
    // Acentuadas
    '\u00C1':'A','\u00E1':'A',
    '\u00C0':'A','\u00E0':'A',
    '\u00C2':'A','\u00E2':'A',
    '\u00C3':'A','\u00E3':'A',
    '\u00C9':'E','\u00E9':'E',
    '\u00CA':'E','\u00EA':'E',
    '\u00CD':'I','\u00ED':'I',
    '\u00D3':'O','\u00F3':'O',
    '\u00D4':'O','\u00F4':'O',
    '\u00D5':'O','\u00F5':'O',
    '\u00DA':'U','\u00FA':'U',
    '\u00C7':'C','\u00E7':'C'
};

/**
 * Retorna o LETTER_PATHS para um caractere, com fallback para a letra base.
 * Retorna null se não houver definição conhecida.
 */
function getLetterPath(ch) {
    var upper = ch ? ch.toUpperCase() : '';
    if (LETTER_PATHS[upper] && LETTER_PATHS[upper].strokes) {
        return LETTER_PATHS[upper];
    }
    var base = LETTER_BASE_MAP[ch] || LETTER_BASE_MAP[upper];
    if (base && LETTER_PATHS[base] && LETTER_PATHS[base].strokes) {
        return LETTER_PATHS[base];
    }
    return null;
}

// ============================================================
// UTILITÁRIOS GEOMÉTRICOS
// ============================================================

function distSq(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
}

function dist(a, b) {
    return Math.sqrt(distSq(a, b));
}

function pointToSegmentDist(p, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return dist(p, a);
    var t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
    return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
}

/**
 * Para um ponto P e um polyline, retorna {d, t} onde:
 *   d = distância mínima ao polyline
 *   t = posição normalizada (0-1) ao longo do polyline
 */
function closestOnPolyline(p, polyline) {
    if (!polyline || polyline.length === 0) return { d: Infinity, t: 0 };
    if (polyline.length === 1) return { d: dist(p, polyline[0]), t: 0 };

    var totalLen = 0;
    var segLengths = [];
    for (var i = 0; i < polyline.length - 1; i++) {
        var s = dist(polyline[i], polyline[i + 1]);
        segLengths.push(s);
        totalLen += s;
    }
    if (totalLen === 0) return { d: dist(p, polyline[0]), t: 0 };

    var bestD = Infinity, bestT = 0, cumLen = 0;
    for (var j = 0; j < polyline.length - 1; j++) {
        var a = polyline[j], b = polyline[j + 1];
        var dx = b.x - a.x, dy = b.y - a.y;
        var sLen = segLengths[j];
        var sLenSq = sLen * sLen;
        var tSeg = (sLenSq === 0) ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / sLenSq));
        var closestPt = { x: a.x + tSeg * dx, y: a.y + tSeg * dy };
        var d = dist(p, closestPt);
        if (d < bestD) {
            bestD = d;
            bestT = (cumLen + tSeg * sLen) / totalLen;
        }
        cumLen += sLen;
    }
    return { d: bestD, t: bestT };
}

function polylineLength(pts) {
    var len = 0;
    if (!pts || pts.length < 2) return 0;
    for (var i = 0; i < pts.length - 1; i++) len += dist(pts[i], pts[i + 1]);
    return len;
}

/**
 * Reamostra um polyline com espaçamento aproximadamente uniforme.
 */
function resamplePolyline(pts, step, minPoints) {
    if (!pts || pts.length === 0) return [];
    minPoints = minPoints || 10;
    var totalLen = polylineLength(pts);
    if (totalLen === 0 || pts.length < 2) return pts.slice();
    var actualStep = totalLen / Math.max(minPoints - 1, 1);
    step = Math.min(step > 0 ? step : actualStep, actualStep);

    var result = [{ x: pts[0].x, y: pts[0].y }];
    var accumulated = 0;
    for (var i = 0; i < pts.length - 1; i++) {
        var ax = pts[i].x, ay = pts[i].y;
        var bx = pts[i+1].x, by = pts[i+1].y;
        var segLen = dist(pts[i], pts[i+1]);
        var walked = 0;
        while (accumulated + (segLen - walked) >= step) {
            var t = (step - accumulated) / (segLen - walked);
            walked += (step - accumulated);
            var nx = ax + t * (bx - ax);
            var ny = ay + t * (by - ay);
            ax = nx; ay = ny;
            result.push({ x: nx, y: ny });
            accumulated = 0;
        }
        accumulated += segLen - walked;
    }
    var last = pts[pts.length - 1];
    if (result.length < 2 || dist(last, result[result.length - 1]) > 1) {
        result.push({ x: last.x, y: last.y });
    }
    return result;
}

/**
 * Filtra pontos muito próximos para reduzir ruído.
 */
function filterNearbyPoints(pts, minD) {
    if (!pts || pts.length === 0) return [];
    var result = [pts[0]];
    for (var i = 1; i < pts.length; i++) {
        if (dist(pts[i], result[result.length - 1]) >= minD) {
            result.push(pts[i]);
        }
    }
    return result;
}

// ============================================================
// ESCALA DOS TRAÇADOS NORMALIZADOS PARA COORDENADAS DO CANVAS
// ============================================================

/**
 * Converte um stroke normalizado (0-1) para coordenadas absolutas.
 * m = objeto de métricas da letra (de getLetterMetrics()).
 */
function scaleStroke(normalizedStroke, m) {
    var letterHeight = m.y2 - m.y1;
    return normalizedStroke.map(function(pt) {
        return {
            x: m.x1 + pt.x * m.width,
            y: m.y1 + pt.y * letterHeight
        };
    });
}

/**
 * Retorna todos os strokes de uma letra escalados para o canvas.
 * Retorna null se não houver definição para o caractere.
 */
function getScaledStrokesForLetter(ch, m) {
    var path = getLetterPath(ch);
    if (!path) return null;
    return path.strokes.map(function(stroke) {
        return scaleStroke(stroke, m);
    });
}

/**
 * Retorna array plano de pontos escalados (todos os strokes combinados,
 * reamostrados a passo uniforme). Usado para calcular cobertura.
 */
function getAllScaledPointsForLetter(ch, m, sampleStep) {
    var scaledStrokes = getScaledStrokesForLetter(ch, m);
    if (!scaledStrokes) return null;
    var all = [];
    scaledStrokes.forEach(function(stroke) {
        var resampled = resamplePolyline(stroke, sampleStep || 5, 12);
        resampled.forEach(function(pt) { all.push(pt); });
    });
    return all;
}

// ============================================================
// FUNÇÕES DE AVALIAÇÃO INDIVIDUAL
// ============================================================

/**
 * COBERTURA: que fração dos pontos esperados o usuário cobriu?
 * @returns {number} 0-100
 */
function calculateCoverage(expectedPoints, userPoints, tolerance) {
    if (!expectedPoints || expectedPoints.length === 0) return 0;
    if (!userPoints || userPoints.length === 0) return 0;
    var tolSq = tolerance * tolerance;
    var covered = 0;
    for (var i = 0; i < expectedPoints.length; i++) {
        var ep = expectedPoints[i];
        for (var j = 0; j < userPoints.length; j++) {
            var dx = ep.x - userPoints[j].x;
            var dy = ep.y - userPoints[j].y;
            if (dx * dx + dy * dy <= tolSq) { covered++; break; }
        }
    }
    return Math.min(100, Math.round((covered / expectedPoints.length) * 100));
}

/**
 * PRECISAO ESPACIAL: que fração dos pontos do USUÁRIO está próximo do traçado?
 * Pune rabiscos com muitos pontos fora do caminho esperado.
 * @returns {number} 0-100
 */
function calculateSpatialAccuracy(scaledStrokes, userPoints, tolerance) {
    if (!userPoints || userPoints.length === 0) return 0;
    if (!scaledStrokes || scaledStrokes.length === 0) return 0;
    var validCount = 0;
    for (var i = 0; i < userPoints.length; i++) {
        var p = userPoints[i];
        var minD = Infinity;
        for (var s = 0; s < scaledStrokes.length; s++) {
            var poly = scaledStrokes[s];
            if (poly.length < 2) continue;
            for (var k = 0; k < poly.length - 1; k++) {
                var d = pointToSegmentDist(p, poly[k], poly[k + 1]);
                if (d < minD) minD = d;
            }
        }
        if (minD <= tolerance) validCount++;
    }
    return Math.min(100, Math.round((validCount / userPoints.length) * 100));
}

/**
 * RAZAO FORA DO CAMINHO: complemento da precisão espacial.
 * @returns {number} 0-1
 */
function calculateOutOfBoundsRatio(scaledStrokes, userPoints, tolerance) {
    if (!userPoints || userPoints.length === 0) return 0;
    var acc = calculateSpatialAccuracy(scaledStrokes, userPoints, tolerance);
    return 1 - acc / 100;
}

/**
 * ORDEM DO TRACADO: analisa se o usuário percorreu o caminho da letra
 * aproximadamente na direção correta (progressão crescente em t).
 * @returns {number} 0-100
 */
function calculateStrokeOrder(combinedExpected, userPoints, regressionTolerance) {
    if (!userPoints || userPoints.length < 3) return 50;
    if (!combinedExpected || combinedExpected.length < 2) return 50;

    var reg = regressionTolerance || 0.18;
    var tValues = userPoints.map(function(p) {
        return closestOnPolyline(p, combinedExpected).t;
    });

    var good = 0, total = 0;
    for (var i = 1; i < tValues.length; i++) {
        total++;
        if (tValues[i] >= tValues[i - 1] - reg) good++;
    }
    if (total === 0) return 50;
    return Math.min(100, Math.round((good / total) * 100));
}

/**
 * DIRECAO: verifica se o usuário percorreu cada stroke no sentido ensinado.
 * @returns {number} 0-100
 */
function calculateDirectionScore(scaledStrokes, allUserPoints, tolerance) {
    if (!scaledStrokes || scaledStrokes.length === 0) return 50;
    if (!allUserPoints || allUserPoints.length < 2) return 50;

    var correct = 0, total = 0;
    scaledStrokes.forEach(function(stroke) {
        if (stroke.length < 2) return;
        var localPts = allUserPoints.filter(function(p) {
            var minD = Infinity;
            for (var k = 0; k < stroke.length - 1; k++) {
                var d = pointToSegmentDist(p, stroke[k], stroke[k + 1]);
                if (d < minD) minD = d;
            }
            return minD <= tolerance * 1.5;
        });
        if (localPts.length < 3) return;
        var tFirst = closestOnPolyline(localPts[0], stroke).t;
        var tLast  = closestOnPolyline(localPts[localPts.length - 1], stroke).t;
        total++;
        if (tFirst < tLast + 0.25) correct++;
    });

    if (total === 0) return 60;
    return Math.min(100, Math.round((correct / total) * 100));
}

/**
 * COMPRIMENTO DO TRACADO: pune rabiscos excessivamente longos.
 * @returns {number} 0-100
 */
function calculateStrokeLengthScore(scaledStrokes, userStrokes, maxRatio) {
    if (!scaledStrokes || scaledStrokes.length === 0) return 50;
    if (!userStrokes || userStrokes.length === 0) return 50;

    var expectedLen = 0;
    scaledStrokes.forEach(function(s) { expectedLen += polylineLength(s); });
    if (expectedLen < 5) return 50;

    var userLen = 0;
    userStrokes.forEach(function(s) {
        if (s && s.points) userLen += polylineLength(s.points);
    });

    var ratio = userLen / expectedLen;
    if (ratio <= 0.2) return 20;
    if (ratio <= 1.0) return Math.round(60 + ratio * 40);
    if (ratio <= 1.8) return 100;
    if (ratio <= (maxRatio || 4.5)) {
        return Math.max(0, Math.round(100 - ((ratio - 1.8) / ((maxRatio || 4.5) - 1.8)) * 100));
    }
    return 0;
}

/**
 * COMPLETUDE DOS STROKES: verifica se o usuário passou pelo início
 * e pelo fim de cada stroke essencial.
 * @returns {number} 0-100
 */
function calculateStrokeCompletion(scaledStrokes, allUserPoints, tolerance) {
    if (!scaledStrokes || scaledStrokes.length === 0) return 50;
    if (!allUserPoints || allUserPoints.length === 0) return 0;

    var completed = 0;
    var tolSq = tolerance * tolerance;
    scaledStrokes.forEach(function(stroke) {
        if (stroke.length < 2) { completed++; return; }
        var start = stroke[0], end = stroke[stroke.length - 1];
        var startOk = false, endOk = false;
        for (var i = 0; i < allUserPoints.length; i++) {
            var dx1 = allUserPoints[i].x - start.x, dy1 = allUserPoints[i].y - start.y;
            if (dx1*dx1 + dy1*dy1 <= tolSq * 4) startOk = true;
            var dx2 = allUserPoints[i].x - end.x,   dy2 = allUserPoints[i].y - end.y;
            if (dx2*dx2 + dy2*dy2 <= tolSq * 4) endOk = true;
            if (startOk && endOk) break;
        }
        if (startOk && endOk) completed++;
    });
    return Math.min(100, Math.round((completed / scaledStrokes.length) * 100));
}

// ============================================================
// AVALIAÇÃO COMPLETA DE UMA LETRA
// ============================================================

/**
 * Avalia a escrita de uma letra específica com todos os critérios.
 *
 * @param {string} ch           Caractere a avaliar
 * @param {Object} m            Métricas da letra (de getLetterMetrics())
 * @param {Array}  userStrokes  Todos os strokes desenhados [{points:[{x,y}]}]
 * @param {number} attemptBonus Bônus de tolerância por tentativas falhas anteriores
 * @returns {Object} Resultado detalhado da avaliação
 */
function evaluateLetter(ch, m, userStrokes, attemptBonus) {
    var cfg = WRITING_EVALUATION_CONFIG;
    var bonusFactor = 1 + Math.min(
        (attemptBonus || 0),
        cfg.maxAttemptBonus * cfg.attemptToleranceBonus
    );

    var tolerance = m.fontSize * cfg.pathToleranceFactor * bonusFactor;

    var scaledStrokes = getScaledStrokesForLetter(ch, m);
    if (!scaledStrokes) {
        // Sem traçado definido: retorno neutro (não penaliza, não aprova)
        return {
            char: ch, score: 50, coverage: 50, spatialAccuracy: 50,
            orderScore: 50, directionScore: 50, lengthScore: 50,
            completionScore: 50, outsideRatio: 0.5, passed: true,
            scaledStrokes: null, fallback: true
        };
    }

    // Bounding box expandida para coleta de pontos desta letra
    var bbox = {
        x1: m.x1 - tolerance * 1.5, x2: m.x2 + tolerance * 1.5,
        y1: m.y1 - tolerance * 1.5, y2: m.y2 + tolerance * 1.5
    };

    var localUserStrokes = (userStrokes || []).map(function(st) {
        if (!st || !st.points) return { points: [] };
        return { points: st.points.filter(function(p) {
            return p.x >= bbox.x1 && p.x <= bbox.x2 &&
                   p.y >= bbox.y1 && p.y <= bbox.y2;
        })};
    }).filter(function(st) { return st.points.length > 0; });

    var rawUserPoints = [];
    localUserStrokes.forEach(function(st) {
        st.points.forEach(function(p) { rawUserPoints.push(p); });
    });

    var allUserPoints = filterNearbyPoints(rawUserPoints, cfg.sampleMinDistance);

    if (allUserPoints.length < cfg.minPointsPerStroke) {
        return {
            char: ch, score: 0, coverage: 0, spatialAccuracy: 0,
            orderScore: 0, directionScore: 0, lengthScore: 0,
            completionScore: 0, outsideRatio: 1, passed: false,
            scaledStrokes: scaledStrokes
        };
    }

    // Pontos reamostrados do traçado esperado
    var expectedPoints = getAllScaledPointsForLetter(ch, m, Math.max(4, tolerance * 0.5));

    // Polyline combinada (todos os strokes em sequência) para análise de ordem
    var combinedExpected = [];
    scaledStrokes.forEach(function(stroke) {
        stroke.forEach(function(pt) { combinedExpected.push(pt); });
    });

    var coverage         = calculateCoverage(expectedPoints, allUserPoints, tolerance);
    var spatialAccuracy  = calculateSpatialAccuracy(scaledStrokes, allUserPoints, tolerance);
    var outsideRatio     = 1 - spatialAccuracy / 100;
    var orderScore       = calculateStrokeOrder(combinedExpected, allUserPoints, cfg.orderRegressionTolerance);
    var directionScore   = calculateDirectionScore(scaledStrokes, allUserPoints, tolerance);
    var lengthScore      = calculateStrokeLengthScore(scaledStrokes, localUserStrokes, cfg.maxLengthRatio);
    var completionScore  = calculateStrokeCompletion(scaledStrokes, allUserPoints, tolerance);

    var rawScore =
        coverage        * cfg.weightCoverage +
        spatialAccuracy * cfg.weightSpatialAccuracy +
        orderScore      * cfg.weightOrder +
        directionScore  * cfg.weightDirection +
        completionScore * cfg.weightStrokeCompletion;

    var finalScore = Math.min(100, Math.round(rawScore));

    // Todos os critérios mínimos devem ser satisfeitos
    var minCov = cfg.minCoverage * bonusFactor;
    var minAcc = cfg.minSpatialAccuracy * bonusFactor;
    var passed =
        finalScore >= cfg.minScore &&
        coverage >= minCov &&
        spatialAccuracy >= minAcc &&
        outsideRatio <= cfg.maxOutsideRatio &&
        lengthScore > 0;

    if (WRITING_DEBUG) {
        console.group('Avaliacao letra: ' + ch);
        console.log('Cobertura:         ' + coverage);
        console.log('Precisao espacial: ' + spatialAccuracy);
        console.log('Ordem:             ' + orderScore);
        console.log('Direcao:           ' + directionScore);
        console.log('Comprimento:       ' + lengthScore);
        console.log('Completude:        ' + completionScore);
        console.log('Fora do caminho:   ' + Math.round(outsideRatio * 100) + '%');
        console.log('Nota final:        ' + finalScore);
        console.log('Aprovada:          ' + passed);
        console.groupEnd();
    }

    return {
        char: ch, score: finalScore, coverage: coverage,
        spatialAccuracy: spatialAccuracy, orderScore: orderScore,
        directionScore: directionScore, lengthScore: lengthScore,
        completionScore: completionScore, outsideRatio: outsideRatio,
        passed: passed, scaledStrokes: scaledStrokes
    };
}

// ============================================================
// ESTADO E FUNÇÕES DA DEMONSTRACAO ANIMADA
// ============================================================

var demoState = {
    active: false,
    rafId: null,
    timers: [],
    onComplete: null
};

function stopDemo() {
    demoState.active = false;
    if (demoState.rafId) { cancelAnimationFrame(demoState.rafId); demoState.rafId = null; }
    demoState.timers.forEach(function(t) { clearTimeout(t); });
    demoState.timers = [];
}

function demoTimeout(fn, ms) {
    if (!demoState.active) return;
    var id = setTimeout(function() {
        if (!demoState.active) return;
        fn();
    }, ms);
    demoState.timers.push(id);
    return id;
}

/**
 * Anima o traçado progressivo de um único stroke.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} stroke          Coordenadas do canvas [{x,y}]
 * @param {Function} getBackground Redesenha o fundo a cada frame
 * @param {Function} onDone       Chamado quando o stroke termina
 * @param {number} speedMs        Duração total da animação (ms)
 */
function animateSingleStroke(ctx, stroke, getBackground, onDone, speedMs) {
    if (!demoState.active || !stroke || stroke.length < 2) {
        if (onDone) onDone();
        return;
    }
    speedMs = speedMs || 1200;
    var startTime = null;
    var totalLen = polylineLength(stroke);

    function frame(ts) {
        if (!demoState.active) return;
        if (!startTime) startTime = ts;
        var progress = Math.min(1, (ts - startTime) / speedMs);
        var targetLen = totalLen * progress;

        // Fundo
        getBackground();

        var drawn = 0, curX = stroke[0].x, curY = stroke[0].y;

        // Traço percorrido
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 140, 0, 0.85)';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(255, 180, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (var i = 1; i < stroke.length; i++) {
            var segLen = dist(stroke[i - 1], stroke[i]);
            if (drawn + segLen <= targetLen) {
                ctx.lineTo(stroke[i].x, stroke[i].y);
                curX = stroke[i].x; curY = stroke[i].y;
                drawn += segLen;
            } else {
                var t = (targetLen - drawn) / Math.max(segLen, 0.001);
                curX = stroke[i-1].x + t * (stroke[i].x - stroke[i-1].x);
                curY = stroke[i-1].y + t * (stroke[i].y - stroke[i-1].y);
                ctx.lineTo(curX, curY);
                break;
            }
        }
        ctx.stroke();
        ctx.restore();

        // Ponto de início
        if (progress < 0.2) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(stroke[0].x, stroke[0].y, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#2E7D32';
            ctx.shadowColor = 'rgba(46,125,50,0.5)';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
        }

        // Ponta da caneta
        ctx.save();
        ctx.beginPath();
        ctx.arc(curX, curY, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#FF8F00';
        ctx.shadowColor = 'rgba(255, 140, 0, 0.7)';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();

        if (progress < 1) {
            demoState.rafId = requestAnimationFrame(frame);
        } else {
            if (onDone) onDone();
        }
    }

    demoState.rafId = requestAnimationFrame(frame);
}

/**
 * Executa a demonstração completa de uma ou mais letras em sequência.
 *
 * @param {Object} params
 *   ctx                  CanvasRenderingContext2D
 *   letterMetrics        Array de métricas das letras
 *   getBackground        Callback para redesenhar o fundo
 *   onLetterStart        Callback(m, idx) — início de cada letra
 *   onLetterEnd          Callback(m, idx) — fim de cada letra
 *   onComplete           Callback — fim da demonstração
 *   strokeSpeedMs        Velocidade de cada stroke (ms)
 *   pauseBetweenStrokes  Pausa entre strokes de uma mesma letra (ms)
 *   pauseBetweenLetters  Pausa entre letras diferentes (ms)
 */
function runLetterDemo(params) {
    var ctx             = params.ctx;
    var metrics         = params.letterMetrics;
    var getBackground   = params.getBackground;
    var onLetterStart   = params.onLetterStart   || function() {};
    var onLetterEnd     = params.onLetterEnd     || function() {};
    var onComplete      = params.onComplete      || function() {};
    var strokeSpeedMs   = params.strokeSpeedMs   || 1100;
    var pauseStrokes    = params.pauseBetweenStrokes || 350;
    var pauseLetters    = params.pauseBetweenLetters || 900;

    demoState.active = true;
    var letterIdx = 0;

    function nextLetter() {
        if (!demoState.active) return;
        if (letterIdx >= metrics.length) { onComplete(); return; }

        var m = metrics[letterIdx];
        var scaledStrokes = getScaledStrokesForLetter(m.char, m);
        onLetterStart(m, letterIdx);

        if (!scaledStrokes || scaledStrokes.length === 0) {
            letterIdx++;
            demoTimeout(nextLetter, pauseLetters);
            return;
        }

        var strokeIdx = 0;
        function nextStroke() {
            if (!demoState.active) return;
            if (strokeIdx >= scaledStrokes.length) {
                onLetterEnd(m, letterIdx);
                letterIdx++;
                demoTimeout(nextLetter, pauseLetters);
                return;
            }
            var stroke = scaledStrokes[strokeIdx++];
            animateSingleStroke(ctx, stroke, getBackground, function() {
                demoTimeout(nextStroke, pauseStrokes);
            }, strokeSpeedMs);
        }
        nextStroke();
    }

    nextLetter();
}

// ============================================================
// EXPORTACOES GLOBAIS
// ============================================================
window.LETTER_PATHS               = LETTER_PATHS;
window.WRITING_EVALUATION_CONFIG  = WRITING_EVALUATION_CONFIG;
window.WRITING_DEBUG              = WRITING_DEBUG;

window.getLetterPath              = getLetterPath;
window.scaleStroke                = scaleStroke;
window.getScaledStrokesForLetter  = getScaledStrokesForLetter;
window.getAllScaledPointsForLetter = getAllScaledPointsForLetter;

window.polylineLength             = polylineLength;
window.filterNearbyPoints         = filterNearbyPoints;
window.resamplePolyline           = resamplePolyline;
window.distSq                     = distSq;
window.dist                       = dist;
window.pointToSegmentDist         = pointToSegmentDist;
window.closestOnPolyline          = closestOnPolyline;

window.calculateCoverage          = calculateCoverage;
window.calculateSpatialAccuracy   = calculateSpatialAccuracy;
window.calculateOutOfBoundsRatio  = calculateOutOfBoundsRatio;
window.calculateStrokeOrder       = calculateStrokeOrder;
window.calculateDirectionScore    = calculateDirectionScore;
window.calculateStrokeLengthScore = calculateStrokeLengthScore;
window.calculateStrokeCompletion  = calculateStrokeCompletion;
window.evaluateLetter             = evaluateLetter;

window.demoState                  = demoState;
window.stopDemo                   = stopDemo;
window.runLetterDemo              = runLetterDemo;
window.animateSingleStroke        = animateSingleStroke;
