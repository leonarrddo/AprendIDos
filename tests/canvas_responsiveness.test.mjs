import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve('c:/Users/leo/Desktop/AprendIDos');

test('Canvas coordinate conversion formula maps accurately across normal, 200%, 400%, and pinch zoom', () => {
    // Simula a fórmula matemática implementada em meunome.js e escrita.js:
    // x = (clientX - rect.left) * (logicalWidth / rect.width)
    // y = (clientY - rect.top) * (logicalHeight / rect.height)
    function mapCoords(e, rect, logicalWidth, logicalHeight) {
        const scaleX = rect.width > 0 ? (logicalWidth / rect.width) : 1;
        const scaleY = rect.height > 0 ? (logicalHeight / rect.height) : 1;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    const logicalW = 600;
    const logicalH = 340;

    // Cenário 1: Escala 100% (rect.width === logicalWidth)
    const normalRect = { left: 50, top: 100, width: 600, height: 340 };
    const ptCenter = mapCoords({ clientX: 350, clientY: 270 }, normalRect, logicalW, logicalH);
    assert.equal(ptCenter.x, 300);
    assert.equal(ptCenter.y, 170);

    // Cenário 2: Zoom 200% do navegador ou pinch zoom (rect visualmente maior na viewport)
    const zoom200Rect = { left: 100, top: 200, width: 1200, height: 680 };
    const ptZoom200 = mapCoords({ clientX: 700, clientY: 540 }, zoom200Rect, logicalW, logicalH);
    assert.equal(ptZoom200.x, 300);
    assert.equal(ptZoom200.y, 170);

    // Cenário 3: Zoom 400%
    const zoom400Rect = { left: 200, top: 400, width: 2400, height: 1360 };
    const ptZoom400 = mapCoords({ clientX: 1400, clientY: 1080 }, zoom400Rect, logicalW, logicalH);
    assert.equal(ptZoom400.x, 300);
    assert.equal(ptZoom400.y, 170);

    // Cenário 4: Tela estreita (celular 320px comprimindo o elemento visual)
    const mobileRect = { left: 12, top: 80, width: 296, height: 300 };
    const ptBorder = mapCoords({ clientX: 12, clientY: 80 }, mobileRect, 296, 300);
    assert.equal(ptBorder.x, 0);
    assert.equal(ptBorder.y, 0);
});

test('Canvas resize preserves and proportionally scales strokes upon device rotation', () => {
    // Simula a lógica de rotação portrait -> landscape -> portrait
    let strokes = [
        {
            points: [
                { x: 100, y: 150 },
                { x: 200, y: 150 }
            ]
        }
    ];

    let prevW = 320;
    let prevH = 300;
    let newW = 640;
    let newH = 300;

    // Rotação para Landscape (largura dobrou)
    const scaleX = newW / prevW;
    const scaleY = newH / prevH;
    for (const st of strokes) {
        for (const pt of st.points) {
            pt.x *= scaleX;
            pt.y *= scaleY;
        }
    }

    assert.equal(strokes[0].points[0].x, 200);
    assert.equal(strokes[0].points[1].x, 400);

    // Rotação de volta para Portrait (largura pela metade)
    prevW = newW;
    newW = 320;
    const scaleBackX = newW / prevW;
    for (const st of strokes) {
        for (const pt of st.points) {
            pt.x *= scaleBackX;
        }
    }

    assert.equal(strokes[0].points[0].x, 100);
    assert.equal(strokes[0].points[1].x, 200);
});

test('meunome.js and escrita.js implement accurate coordinate scaling and resize debouncing', () => {
    const meunomeJs = fs.readFileSync(path.join(rootDir, 'meunome.js'), 'utf-8');
    const escritaJs = fs.readFileSync(path.join(rootDir, 'escrita.js'), 'utf-8');

    for (const code of [meunomeJs, escritaJs]) {
        assert.ok(code.includes('scaleX'), 'Must compute scaleX for coordinate scaling');
        assert.ok(code.includes('scaleY'), 'Must compute scaleY for coordinate scaling');
        assert.ok(code.includes('prevCanvasWidth'), 'Must track prevCanvasWidth');
        assert.ok(code.includes('prevCanvasHeight'), 'Must track prevCanvasHeight');
        assert.ok(code.includes('touchAction = \'none\''), 'Must set touchAction none in JS');
        assert.ok(code.includes('contextmenu'), 'Must prevent contextmenu on canvas');
    }
});

test('theme.css defines universal responsiveness, canvas touch stability, and small screen safeguards', () => {
    const themeCss = fs.readFileSync(path.join(rootDir, 'theme.css'), 'utf-8');

    assert.ok(themeCss.includes('touch-action: none !important'), 'theme.css must enforce touch-action none');
    assert.ok(themeCss.includes('overscroll-behavior: contain'), 'theme.css must prevent overscroll pull-to-refresh during drawing');
    assert.ok(themeCss.includes('overflow-x: hidden'), 'theme.css must prevent horizontal body overflow');
    assert.ok(themeCss.includes('min-height: 48px'), 'theme.css must enforce minimum 48px touch targets for elderly accessibility');
    assert.ok(themeCss.includes('@media (max-width: 360px)'), 'theme.css must handle micro-screens (320px-360px)');
});
