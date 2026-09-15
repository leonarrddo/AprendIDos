/**
 * ============================================================================
 * AprendIDos - Atividade Interativa: Conhecendo as Vogais
 * Arquivo: vogais.js
 * 
 * Sistema de Áudio Duplo (Google TTS + Web Speech API)
 * Garante reprodução de som cristalino em 100% dos navegadores!
 * ============================================================================
 */

import { saveLessonProgress } from './auth.js';

var vowelData = {
    a: { letter: 'A', example: 'Avião' },
    e: { letter: 'E', example: 'Escada' },
    i: { letter: 'I', example: 'Ilha' },
    o: { letter: 'O', example: 'Ônibus' },
    u: { letter: 'U', example: 'Urso' }
};

// Significados claros, objetivos e adequados para o público idoso e adulto
var wordMeanings = {
    // ── VOGAL A (40 palavras) ──
    'Abelha': 'Inseto voador conhecido por produzir mel e cera e por polinizar flores e plantações.',
    'Árvore': 'Planta de grande porte com tronco lenhoso, galhos e folhas, que fornece sombra, oxigênio e frutos.',
    'Amigo': 'Indivíduo com quem se tem uma relação de afeto, companheirismo e confiança mútua.',
    'Amor': 'Sentimento profundo de afeição, carinho e dedicação por outra pessoa ou causa.',
    'Avó': 'Mãe da mãe ou mãe do pai de uma pessoa.',
    'Avô': 'Pai da mãe ou pai do pai de uma pessoa.',
    'Água': 'Substância líquida, incolor e transparente, essencial para a hidratação e a sobrevivência de todos os seres vivos.',
    'Alface': 'Hortaliça de folhas comestíveis amplamente cultivada e consumida crua em saladas.',
    'Azul': 'Uma das cores primárias, correspondente à tonalidade do céu límpido e do mar profundo.',
    'Abóbora': 'Legume de casca grossa e polpa alaranjada, rico em vitaminas, usado no preparo de pratos doces e salgados.',
    'Abraço': 'Gesto de envolver alguém com os braços como demonstração de afeto, acolhimento ou consolo.',
    'Açúcar': 'Substância de sabor doce obtida da cana ou da beterraba, utilizada para adoçar alimentos e bebidas.',
    'Alegria': 'Estado de viva satisfação, contentamento e bem-estar que provoca riso e bom humor.',
    'Aluno': 'Indivíduo que frequenta aulas para receber ensino e instrução de um professor.',
    'Anel': 'Aro de metal precioso ou outro material usado como ornamento nos dedos da mão.',
    'Arco': 'Estrutura em formato de curva, ou artefato com corda curvada utilizado para lançar flechas.',
    'Avião': 'Meio de transporte aéreo motorizado com asas fixas, utilizado para transportar passageiros e cargas.',
    'Avental': 'Peça de tecido colocada sobre a roupa para protegê-la de sujeiras durante tarefas domésticas ou profissionais.',
    'Aranha': 'Animal artrópode de oito patas pertencente à classe dos aracnídeos, conhecido por tecer teias.',
    'Amora': 'Fruto arredondado e carnoso da amoreira, de coloração roxa ou avermelhada e sabor doce com leve acidez.',
    'Almofada': 'Peça de tecido recheada de espuma ou plumas, usada para acomodar o corpo com conforto em sofás e camas.',
    'Anzol': 'Gancho pontiagudo de metal preso a uma linha de pesca, utilizado na captura de peixes.',
    'Apito': 'Instrumento de sopro pequeno que emite um som agudo e forte ao ser acionado com a respiração.',
    'Arame': 'Fio metálico fino e maleável, amplamente empregado na confecção de cercas, artesanato e amarrações.',
    'Areia': 'Conjunto de pequenos grãos minerais resultantes da fragmentação de rochas, encontrados em praias e rios.',
    'Armário': 'Móvel com portas e prateleiras destinado à organização e guarda de roupas, mantimentos ou louças.',
    'Aula': 'Período de tempo dedicado ao aprendizado e à explicação de matérias por um professor.',
    'Aveia': 'Cereal rico em fibras solúveis e nutrientes, muito consumido na forma de flocos, farelo ou farinha.',
    'Azulejo': 'Placa fina de cerâmica vidrada aplicada no revestimento e proteção de paredes de cozinhas e banheiros.',
    'Agulha': 'Haste fina de aço com ponta afiada e um orifício na outra extremidade para passagem da linha de costura.',
    'Alho': 'Bulbo comestível de sabor e odor acentuados, muito empregado como tempero na culinária e na medicina natural.',
    'Aliança': 'Anel de ouro ou outro metal nobre usado no dedo anelar como símbolo público de união ou casamento.',
    'Azeite': 'Óleo vegetal puro extraído de azeitonas, utilizado como ingrediente culinário e tempero de alimentos.',
    'Abacaxi': 'Fruto tropical de casca áspera e escamosa com coroa folhosa, de polpa amarela suculenta e sabor ácido-doce.',
    'Abacate': 'Fruto de polpa cremosa verde-amarelada com semente central única, rico em gorduras boas e nutrientes.',
    'Arroz': 'Cereal cultivado em quase todo o mundo cujos grãos cozidos constituem a base da alimentação cotidiana.',
    'Asa': 'Membro ou estrutura corporal que possibilita o voo de aves, morcegos e insetos, ou sustentação em aeronaves.',
    'Agasalho': 'Peça de vestuário grossa e quente utilizada para manter o corpo aquecido em dias de temperatura baixa.',
    'Alma': 'Conceito que se refere ao princípio imaterial, consciência e essência moral do ser humano.',
    'Amarelo': 'Cor primária correspondente à tonalidade visível do ouro, da luz solar e do girassol.',

    // ── VOGAL E (40 palavras) ──
    'Escola': 'Instituição pública ou privada destinada ao ensino, aprendizagem e formação educacional das pessoas.',
    'Elefante': 'Maior mamífero terrestre vivo, caracterizado por sua longa tromba, presas de marfim e grandes orelhas.',
    'Estrela': 'Corpo celeste luminoso composto por plasma quente que brilha no espaço cósmico durante a noite.',
    'Escada': 'Estrutura formada por uma sucessão de degraus para permitir a subida ou descida entre diferentes níveis.',
    'Espelho': 'Superfície de vidro polida com fundo metálico refletor que reproduz com fidelidade a imagem à sua frente.',
    'Erva': 'Planta de porte baixo e caule não lenhoso, cujas folhas são utilizadas na culinária ou em infusões medicinais.',
    'Ervilha': 'Leguminosa que produz sementes verdes e arredondadas dentro de vagens, muito consumida cozida ou em conservas.',
    'Estrada': 'Via terrestre aberta e pavimentada para a circulação de veículos automotores e transporte entre localidades.',
    'Enfermeiro': 'Profissional de saúde legalmente habilitado para cuidar de pacientes, aplicar medicações e prestar assistência.',
    'Escova': 'Utensílio composto por cabo com cerdas, usado para higienização dos dentes, pentear cabelos ou limpar objetos.',
    'Envelope': 'Invólucro de papel dobrado e colado, destinado a guardar e proteger cartas, boletos e correspondências.',
    'Espiga': 'Parte reprodutiva de certas plantas gramíneas, como o milho, na qual os grãos se desenvolvem alinhados.',
    'Espada': 'Arma branca cortante e perfurante composta por lâmina longa de metal e empunhadura para a mão.',
    'Estante': 'Móvel composto por prateleiras horizontais sobrepostas, utilizado para organizar livros, documentos ou objetos.',
    'Esponja': 'Material poroso e absorvente, de origem natural ou sintética, usado em tarefas de limpeza e higiene pessoal.',
    'Estojo': 'Acessório com compartimentos e fecho destinado a guardar e transportar canetas, lápis, réguas e borrachas.',
    'Esquilo': 'Pequeno mamífero roedor de cauda volumosa e hábitos arborícolas, que se alimenta de nozes e sementes.',
    'Espuma': 'Massa de bolhas de ar aprisionadas na superfície de um líquido, formada pela agitação de água com sabão.',
    'Esteira': 'Peça tecida com fibras vegetais, palha ou borracha, usada para forrar o piso, praticar exercícios ou deitar.',
    'Égua': 'Fêmea adulta do cavalo, mamífero equino domesticado utilizado para montaria, transporte e trabalho rural.',
    'Elástico': 'Fita ou tira flexível dotada de elasticidade, capaz de se esticar sob tração e retornar ao tamanho original.',
    'Elevador': 'Cabine motorizada com sistema mecânico utilizada para transportar pessoas e cargas entre andares de um edifício.',
    'Emoção': 'Reação psicológica e fisiológica passageira diante de determinados estímulos, como alegria, surpresa ou tristeza.',
    'Empada': 'Salgado de massa quebradiça assada no forno, recheado com frango, carne, queijo ou palmito.',
    'Empadão': 'Torta salgada de tamanho familiar assada no forno, feita com massa frola e recheio farto e temperado.',
    'Enxada': 'Ferramenta de trabalho agrícola com lâmina de metal cortante fixada em ângulo a um cabo comprido de madeira.',
    'Escrita': 'Sistema de representação visual da linguagem oral por meio de sinais gráficos, letras ou caracteres.',
    'Estação': 'Ponto de parada de trens, metrôs ou ônibus; também cada um dos quatro períodos climáticos regulares do ano.',
    'Esmalte': 'Cosmético líquido aplicado sobre as unhas das mãos e dos pés para dar brilho, cor e proteção.',
    'Espinho': 'Estrutura pontiaguda e rígida presente no caule ou folhas de certas plantas, que atua como defesa natural.',
    'Espinafre': 'Planta herbácea de folhas verdes escuras comestíveis, com elevado teor de ferro, minerais e vitaminas.',
    'Enxoval': 'Conjunto de roupas de cama, mesa, banho e vestuário reunido para uso pessoal, matrimônio ou nascimento de um bebê.',
    'Espeto': 'Haste de metal ou madeira pontiaguda usada para fixar alimentos durante o cozimento em grelhas ou brasas.',
    'Enxame': 'Agrupamento numeroso de abelhas ou outros insetos voando ou vivendo em comunidade sob uma rainha.',
    'Estudante': 'Pessoa matriculada que se dedica formalmente ao estudo e à aquisição de novos conhecimentos.',
    'Ensopado': 'Prato culinário composto por carnes ou vegetais cozidos lentamente em caldo temperado e encorpado.',
    'Espantalho': 'Armação vestida com roupas velhas fincada em lavouras para afugentar aves e proteger as plantações.',
    'Entrada': 'Abertura, porta ou via de acesso por onde se ingressa no interior de um imóvel ou recinto fechado.',
    'Espaço': 'Extensão contínua tridimensional onde os corpos se movem; ou a região cósmica fora da atmosfera terrestre.',
    'Enfeite': 'Objeto decorativo utilizado para adornar e embelezar ambientes, roupas ou celebrações.',

    // ── VOGAL I (40 palavras) ──
    'Igreja': 'Edificação consagrada ao culto religioso cristão, orações comunitárias e celebrações de fé.',
    'Ilha': 'Porção de terra emersa cercada de água por todos os lados, situada em oceanos, mares, rios ou lagos.',
    'Inseto': 'Animal invertebrado pertencente aos artrópodes, com corpo dividido em cabeça, tórax e abdômen, e seis patas.',
    'Idoso': 'Homem que atingiu idade avançada, legalmente definida no Brasil a partir dos sessenta anos.',
    'Idosa': 'Mulher que atingiu idade avançada, legalmente definida no Brasil a partir dos sessenta anos.',
    'Inverno': 'Estação do ano caracterizada por temperaturas baixas e noites com maior duração do que os dias.',
    'Irmão': 'Indivíduo do sexo masculino que possui os mesmos pais ou um dos genitores em comum com outra pessoa.',
    'Irmã': 'Indivíduo do sexo feminino que possui os mesmos pais ou um dos genitores em comum com outra pessoa.',
    'Início': 'Ponto de partida temporal ou espacial de um fato, atividade, processo ou obra.',
    'Índio': 'Termo tradicional referente aos indivíduos pertencentes aos povos indígenas originários do território das Américas.',
    'Imagem': 'Representação visual de pessoas, objetos ou paisagens por meio de desenho, pintura, fotografia ou tela.',
    'Ingresso': 'Bilhete impresso ou digital que confere ao portador o direito de entrada em evento, espetáculo ou transporte.',
    'Incêndio': 'Fogo de grandes proporções e fora de controle que destrói vegetação, construções ou materiais diversos.',
    'Ipê': 'Árvore nativa brasileira de madeira nobre, muito conhecida por suas flores intensas que desabrocham no inverno.',
    'Isqueiro': 'Dispositivo mecânico portátil utilizado para gerar chama momentânea por fricção e queima de fluido ou gás.',
    'Iogurte': 'Alimento lácteo cremoso produzido pela fermentação bacteriana natural do leite, rico em nutrientes.',
    'Injeção': 'Aplicação de medicação líquida ou vacina nos tecidos ou na corrente sanguínea por meio de seringa e agulha.',
    'Ímã': 'Objeto com propriedades magnéticas capaz de atrair ferro, aço e outras substâncias metálicas.',
    'Idade': 'Quantidade de tempo decorrida desde o nascimento de um indivíduo até o presente, medida em anos.',
    'Inchaço': 'Elevação de volume em área do corpo provocada pelo acúmulo anormal de líquidos ou processo inflamatório.',
    'Incenso': 'Composto vegetal aromático que, ao queimar lentamente, libera fumaça perfumada para rituais ou aromatização.',
    'Infância': 'Fase inicial do desenvolvimento da vida humana, compreendida entre o nascimento e a puberdade.',
    'Instrumento': 'Objeto ou aparelho concebido para realizar trabalhos técnicos ou para emitir sons e notas musicais.',
    'Iguana': 'Réptil herbívoro da ordem dos lagartos com crista dorsal escamosa, muito comum em regiões tropicais.',
    'Igual': 'Que apresenta as mesmas características, proporções, valor, forma ou natureza que outro elemento comparado.',
    'Irmandade': 'Vínculo fraterno, solidário e leal estabelecido entre membros de uma mesma família ou comunidade.',
    'Ideia': 'Representação mental elaborada pelo pensamento para resolver problemas, criar conceitos ou executar projetos.',
    'Irrigar': 'Ação de aplicar água de forma controlada sobre a terra cultivada para assegurar o crescimento das plantas.',
    'Iluminação': 'Conjunto de fontes de luz natural ou artificial que tornam um ambiente claro e visível para uso humano.',
    'Ilustração': 'Imagem artística ou desenho associado a um texto para elucidar, exemplificar ou enriquecer o conteúdo.',
    'Intervalo': 'Período de pausa, descanso ou transição entre etapas consecutivas de uma atividade ou jornada de trabalho.',
    'Incrível': 'Aquilo que causa espanto, surpresa ou admiração por ser extraordinário ou muito acima do comum.',
    'Inchar': 'Aumentar de volume corporal por retenção excessiva de líquidos ou ar nos tecidos.',
    'Iniciar': 'Dar o primeiro passo para começar uma tarefa, projeto, curso ou atividade.',
    'Inocente': 'Pessoa que não tem responsabilidade ou culpa em falta ou crime; ou que age sem más intenções.',
    'Impressora': 'Aparelho conectado a computadores destinado a transferir textos e imagens digitais para o papel.',
    'Inseticida': 'Produto formulado para controlar, afastar ou erradicar infestações de insetos nocivos.',
    'Invasão': 'Ato não autorizado de penetrar, ocupar ou apossar-se de propriedade, território ou domicílio alheio.',
    'Inveja': 'Sentimento de desprazer ou cobiça motivado pelo sucesso, pelas posses ou pelas qualidades de outra pessoa.',
    'Imposto': 'Valor tributário pago compulsoriamente pelos cidadãos ao governo para custear serviços públicos e infraestrutura.',

    // ── VOGAL O (40 palavras) ──
    'Ovelha': 'Mamífero herbívoro ruminante fêmea da espécie ovina, domesticado para a extração de lã, leite e carne.',
    'Ouro': 'Metal precioso amarelo de alto valor comercial, durável e maleável, muito utilizado em joalheria e moedas.',
    'Olho': 'Órgão sensorial responsável pela visão, capaz de captar a luminosidade e formar imagens no cérebro.',
    'Ônibus': 'Veículo de grande capacidade destinado ao transporte público coletivo de passageiros em cidades e rodovias.',
    'Ovo': 'Alimento de casca rígida produzido por aves e répteis, com gema e clara ricas em proteínas e nutrientes.',
    'Oração': 'Ato de devoção e comunicação com Deus por meio de preces, agradecimentos e pedidos de proteção.',
    'Obra': 'Edificação civil em execução ou concluída; ou produção intelectual e artística criada por um autor.',
    'Osso': 'Peça anatômica rígida e resistente de tecido mineralizado que forma o esqueleto de sustentação dos vertebrados.',
    'Orelha': 'Estrutura externa do sistema auditivo que capta ondas sonoras e as conduz ao tímpano.',
    'Ombro': 'Articulação do corpo humano que liga o membro superior (braço) à parte lateral superior do tórax.',
    'Onça': 'Grande felino carnívoro nativo das Américas, de corpo musculoso e pelagem marcada por rosetas escuras.',
    'Orvalho': 'Gotas de água formadas pela condensação do vapor atmosférico sobre folhas e superfícies frias ao amanhecer.',
    'Ouriço': 'Pequeno animal mamífero coberto por pelos rígidos modificados em espinhos protetores contra predadores.',
    'Outono': 'Estação do ano intermediária entre o verão e o inverno, caracterizada pela queda das folhas e clima ameno.',
    'Outubro': 'Décimo mês do calendário anual civil, composto por trinta e um dias.',
    'Oferta': 'Ato de colocar produtos à venda por preço reduzido; ou ação de oferecer algo generosamente a outra pessoa.',
    'Ostra': 'Molusco marinho com concha dupla calcária que vive preso a rochas submarinas e pode produzir pérolas.',
    'Óculos': 'Dispositivo com lentes graduadas fixadas em armação, posicionado sobre o nariz para corrigir a visão.',
    'Óleo': 'Substância líquida e viscosa, graxa e insolúvel em água, usada na culinária, lubrificação e combustíveis.',
    'Onda': 'Movimento contínuo de oscilação das águas superficiais do mar provocado pelo sopro dos ventos.',
    'Orquídea': 'Planta ornamental valorizada pela grande diversidade de formatos, cores e perfumes de suas flores.',
    'Oca': 'Moradia tradicional ampla construída coletivamente por povos indígenas com madeira e palha.',
    'Oficina': 'Local de trabalho com bancadas e ferramentas para reparo, manutenção ou fabricação de máquinas e objetos.',
    'Orelhão': 'Posto de telefonia pública com cobertura protetora acústica instalado em calçadas para uso comunitário.',
    'Ontem': 'O dia que decorreu imediatamente antes do dia de hoje.',
    'Orquestra': 'Grande agrupamento de músicos instrumentistas que tocam em harmonia sob a regência de um maestro.',
    'Orgulho': 'Sentimento nobre de amor-próprio e satisfação por uma conquista merecida ou por pessoas queridas.',
    'Orla': 'Faixa de terra litorânea urbanizada que acompanha a margem do mar, de um lago ou de um rio.',
    'Ordem': 'Disposição metódica das coisas em seus locais corretos; ou determinação emanada de uma autoridade.',
    'Origem': 'Ponto de nascimento, raiz genealógica, proveniência ou causa primária de onde algo se deriva.',
    'Orégano': 'Planta cujas folhas secas e perfumadas são bastante utilizadas como condimento na culinária internacional.',
    'Oito': 'Numeral cardinal correspondente à soma de sete com mais um, situado antes do nove.',
    'Oitavo': 'Numeral ordinal referente à posição que corresponde ao número oito em uma sequência.',
    'Ocupado': 'Recinto que já contém pessoas ou objetos; ou pessoa com compromissos e sem disponibilidade no momento.',
    'Operário': 'Trabalhador que presta serviços em linhas de produção, fábricas, oficinas e canteiros de obras.',
    'Oceano': 'Vasta massa de água salgada contínua que cobre cerca de setenta por cento da superfície do globo terrestre.',
    'Objeto': 'Coisa material e inanimada perceptível pelos sentidos que pode ser utilizada com alguma utilidade prática.',
    'Ovelhinha': 'Filhote da ovelha ou espécime jovem nos primeiros meses de vida.',
    'Olhada': 'Movimento visual rápido e breve dirigido a um objeto, pessoa ou acontecimento.',
    'Oásis': 'Região isolada e fértil situada no meio de um deserto árido que possui água doce e vegetação natural.',

    // ── VOGAL U (40 palavras) ──
    'Uva': 'Fruto carnoso de casca fina que cresce em cachos, consumido in natura ou usado para vinhos e sucos.',
    'Urubu': 'Ave de grande porte com plumagem preta que desempenha papel essencial na limpeza do meio ambiente.',
    'Urso': 'Grande mamífero carnívoro ou onívoro de pelagem densa, patas fortes e garras robustas que vive em florestas.',
    'Unha': 'Placa protetora rígida de queratina situada na extremidade dorsal dos dedos das mãos e dos pés.',
    'Uniforme': 'Conjunto de roupas padronizadas utilizado por membros de uma corporação, escola ou empresa.',
    'Universo': 'Conjunto ordenado de toda a matéria, radiação, espaço cósmico, galáxias e corpos celestes existentes.',
    'Urgência': 'Necessidade premente que requer intervenção imediata para evitar agravamento de riscos.',
    'Último': 'Elemento posicionado no extremo final de uma ordem sucessiva, após o qual não há outro.',
    'Usina': 'Grande complexo industrial projetado para geração de energia elétrica ou processamento em larga escala.',
    'Útil': 'Que apresenta utilidade prática, atende a uma necessidade real e auxilia na rotina diária.',
    'Urna': 'Caixa receptora lacrada e segura destinada ao depósito e apuração de votos em processos eleitorais.',
    'Úmido': 'Que apresenta discreta presença de água ou vapor retido, sem estar completamente encharcado.',
    'Umbigo': 'Depressão cicatricial central no abdômen formada após a separação do cordão umbilical ao nascer.',
    'Umidade': 'Proporção de vapor de água contido na atmosfera ou na estrutura física de uma substância.',
    'Unidade': 'Qualidade do que é indivisível e único; também designação de instalações de saúde pública nos bairros.',
    'União': 'Associação colaborativa de pessoas ou entidades em prol de objetivos, interesses e respeito comuns.',
    'Único': 'Elemento singular que se destaca por não ter similar, par ou concorrente idêntico no seu gênero.',
    'Ursinho': 'Representação em miniatura confeccionada em tecido de pelúcia no formato de urso.',
    'Urucum': 'Fruto silvestre com cápsulas espinhosas cujas sementes vermelhas produzem corante alimentar e cosmético.',
    'Uivar': 'Produzir som prolongado e estridente de uivo, típico da comunicação entre lobos e cães.',
    'Umbu': 'Fruto arredondado nativo da caatinga brasileira, com casca lisa e polpa suculenta agridoce.',
    'Urtiga': 'Planta cujas folhas possuem pelos urticantes que liberam substâncias irritantes em contato com a pele.',
    'Urgente': 'Demanda ou comunicado de alta relevância que não tolera adiamento.',
    'Uso': 'Ação e efeito de utilizar um instrumento, equipamento ou serviço para determinada finalidade.',
    'Usar': 'Fazer uso ativo de uma ferramenta, roupa, transporte ou método para executar um trabalho.',
    'Usado': 'Artigo que já passou por utilização prévia, mantendo sua funcionalidade preservada.',
    'Urina': 'Substância líquida amarelada expelida pelo organismo contendo resíduos filtrados pelos rins.',
    'Ungento': 'Preparação farmacêutica cremosa e untuosa de uso tópico aplicada na pele para fins terapêuticos.',
    'Uruguai': 'País soberano localizado no sul da América do Sul que compartilha fronteira meridional com o Brasil.',
    'Unicórnio': 'Criatura mítica lendária figurada sob a forma de cavalo branco com um único chifre frontal espiralado.',
    'Urbano': 'Relacionado à cidade, aos seus bairros, à sua população e às suas estruturas públicas.',
    'Ultra': 'Elemento de composição que designa algo localizado além dos limites comuns ou de padrão avançado.',
    'Uvaia': 'Fruto aromático de coloração amarela e sabor ácido, produzido por árvore nativa da Mata Atlântica.',
    'Unificado': 'Que foi agregado, reunido ou consolidado sob uma mesma regra, comando ou organização.',
    'Uivando': 'Que se encontra no ato de emitir uivos de forma contínua.',
    'Utensílio': 'Objeto, apetrecho ou ferramenta de trabalho de serventia diária em ambientes domésticos ou profissionais.',
    'Upa': 'Unidade de Pronto Atendimento, serviço de saúde pública intermediário voltado a urgências clínicas.',
    'Umbro': 'Marca fabril multinacional de origem britânica voltada à produção de calçados e fardamentos esportivos.',
    'Urgindo': 'Que expressa premência ou solicitação com insistência e rapidez.',
    'Umedecer': 'Adicionar moderada quantidade de líquido a uma superfície sem torná-la ensopada.'
};


var wordBank = [
    // ── VOGAL A (40 palavras simples do cotidiano) ──
    { word: 'Abelha',     vowel: 'A' },
    { word: 'Árvore',     vowel: 'A' },
    { word: 'Amigo',      vowel: 'A' },
    { word: 'Amor',       vowel: 'A' },
    { word: 'Avó',        vowel: 'A' },
    { word: 'Avô',        vowel: 'A' },
    { word: 'Água',       vowel: 'A' },
    { word: 'Alface',     vowel: 'A' },
    { word: 'Azul',       vowel: 'A' },
    { word: 'Abóbora',    vowel: 'A' },
    { word: 'Abraço',     vowel: 'A' },
    { word: 'Açúcar',     vowel: 'A' },
    { word: 'Alegria',    vowel: 'A' },
    { word: 'Aluno',      vowel: 'A' },
    { word: 'Anel',       vowel: 'A' },
    { word: 'Arco',       vowel: 'A' },
    { word: 'Avião',      vowel: 'A' },
    { word: 'Avental',    vowel: 'A' },
    { word: 'Aranha',     vowel: 'A' },
    { word: 'Amora',      vowel: 'A' },
    { word: 'Almofada',   vowel: 'A' },
    { word: 'Anzol',      vowel: 'A' },
    { word: 'Apito',      vowel: 'A' },
    { word: 'Arame',      vowel: 'A' },
    { word: 'Areia',      vowel: 'A' },
    { word: 'Armário',    vowel: 'A' },
    { word: 'Aula',       vowel: 'A' },
    { word: 'Aveia',      vowel: 'A' },
    { word: 'Azulejo',    vowel: 'A' },
    { word: 'Agulha',     vowel: 'A' },
    { word: 'Alho',       vowel: 'A' },
    { word: 'Aliança',    vowel: 'A' },
    { word: 'Azeite',     vowel: 'A' },
    { word: 'Abacaxi',    vowel: 'A' },
    { word: 'Abacate',    vowel: 'A' },
    { word: 'Arroz',      vowel: 'A' },
    { word: 'Asa',        vowel: 'A' },
    { word: 'Agasalho',   vowel: 'A' },
    { word: 'Alma',       vowel: 'A' },
    { word: 'Amarelo',    vowel: 'A' },

    // ── VOGAL E (40 palavras simples do cotidiano) ──
    { word: 'Escola',     vowel: 'E' },
    { word: 'Elefante',   vowel: 'E' },
    { word: 'Estrela',    vowel: 'E' },
    { word: 'Escada',     vowel: 'E' },
    { word: 'Espelho',    vowel: 'E' },
    { word: 'Erva',       vowel: 'E' },
    { word: 'Ervilha',    vowel: 'E' },
    { word: 'Estrada',    vowel: 'E' },
    { word: 'Enfermeiro', vowel: 'E' },
    { word: 'Escova',     vowel: 'E' },
    { word: 'Envelope',   vowel: 'E' },
    { word: 'Espiga',     vowel: 'E' },
    { word: 'Espada',     vowel: 'E' },
    { word: 'Estante',    vowel: 'E' },
    { word: 'Esponja',    vowel: 'E' },
    { word: 'Estojo',     vowel: 'E' },
    { word: 'Esquilo',    vowel: 'E' },
    { word: 'Espuma',     vowel: 'E' },
    { word: 'Esteira',    vowel: 'E' },
    { word: 'Égua',       vowel: 'E' },
    { word: 'Elástico',   vowel: 'E' },
    { word: 'Elevador',   vowel: 'E' },
    { word: 'Emoção',     vowel: 'E' },
    { word: 'Empada',     vowel: 'E' },
    { word: 'Empadão',    vowel: 'E' },
    { word: 'Enxada',     vowel: 'E' },
    { word: 'Escrita',    vowel: 'E' },
    { word: 'Estação',    vowel: 'E' },
    { word: 'Esmalte',    vowel: 'E' },
    { word: 'Espinho',    vowel: 'E' },
    { word: 'Espinafre',  vowel: 'E' },
    { word: 'Enxoval',    vowel: 'E' },
    { word: 'Espeto',     vowel: 'E' },
    { word: 'Enxame',     vowel: 'E' },
    { word: 'Estudante',  vowel: 'E' },
    { word: 'Ensopado',   vowel: 'E' },
    { word: 'Espantalho', vowel: 'E' },
    { word: 'Entrada',    vowel: 'E' },
    { word: 'Espaço',     vowel: 'E' },
    { word: 'Enfeite',    vowel: 'E' },

    // ── VOGAL I (40 palavras simples do cotidiano) ──
    { word: 'Igreja',     vowel: 'I' },
    { word: 'Ilha',       vowel: 'I' },
    { word: 'Inseto',     vowel: 'I' },
    { word: 'Idoso',      vowel: 'I' },
    { word: 'Idosa',      vowel: 'I' },
    { word: 'Inverno',    vowel: 'I' },
    { word: 'Irmão',      vowel: 'I' },
    { word: 'Irmã',       vowel: 'I' },
    { word: 'Início',     vowel: 'I' },
    { word: 'Índio',      vowel: 'I' },
    { word: 'Imagem',     vowel: 'I' },
    { word: 'Ingresso',   vowel: 'I' },
    { word: 'Incêndio',   vowel: 'I' },
    { word: 'Ipê',        vowel: 'I' },
    { word: 'Isqueiro',   vowel: 'I' },
    { word: 'Iogurte',    vowel: 'I' },
    { word: 'Injeção',    vowel: 'I' },
    { word: 'Ímã',        vowel: 'I' },
    { word: 'Idade',      vowel: 'I' },
    { word: 'Inchaço',    vowel: 'I' },
    { word: 'Incenso',    vowel: 'I' },
    { word: 'Infância',   vowel: 'I' },
    { word: 'Instrumento',vowel: 'I' },
    { word: 'Iguana',     vowel: 'I' },
    { word: 'Igual',      vowel: 'I' },
    { word: 'Irmandade',  vowel: 'I' },
    { word: 'Ideia',      vowel: 'I' },
    { word: 'Irrigar',    vowel: 'I' },
    { word: 'Iluminação', vowel: 'I' },
    { word: 'Ilustração', vowel: 'I' },
    { word: 'Intervalo',  vowel: 'I' },
    { word: 'Incrível',   vowel: 'I' },
    { word: 'Inchar',     vowel: 'I' },
    { word: 'Iniciar',    vowel: 'I' },
    { word: 'Inocente',   vowel: 'I' },
    { word: 'Impressora', vowel: 'I' },
    { word: 'Inseticida', vowel: 'I' },
    { word: 'Invasão',    vowel: 'I' },
    { word: 'Inveja',     vowel: 'I' },
    { word: 'Imposto',    vowel: 'I' },

    // ── VOGAL O (40 palavras simples do cotidiano) ──
    { word: 'Ovelha',     vowel: 'O' },
    { word: 'Ouro',       vowel: 'O' },
    { word: 'Olho',       vowel: 'O' },
    { word: 'Ônibus',     vowel: 'O' },
    { word: 'Ovo',        vowel: 'O' },
    { word: 'Oração',     vowel: 'O' },
    { word: 'Obra',       vowel: 'O' },
    { word: 'Osso',       vowel: 'O' },
    { word: 'Orelha',     vowel: 'O' },
    { word: 'Ombro',      vowel: 'O' },
    { word: 'Onça',       vowel: 'O' },
    { word: 'Orvalho',    vowel: 'O' },
    { word: 'Ouriço',     vowel: 'O' },
    { word: 'Outono',     vowel: 'O' },
    { word: 'Outubro',    vowel: 'O' },
    { word: 'Oferta',     vowel: 'O' },
    { word: 'Ostra',      vowel: 'O' },
    { word: 'Óculos',     vowel: 'O' },
    { word: 'Óleo',       vowel: 'O' },
    { word: 'Onda',       vowel: 'O' },
    { word: 'Orquídea',   vowel: 'O' },
    { word: 'Oca',        vowel: 'O' },
    { word: 'Oficina',    vowel: 'O' },
    { word: 'Orelhão',    vowel: 'O' },
    { word: 'Ontem',      vowel: 'O' },
    { word: 'Orquestra',  vowel: 'O' },
    { word: 'Orgulho',    vowel: 'O' },
    { word: 'Orla',       vowel: 'O' },
    { word: 'Ordem',      vowel: 'O' },
    { word: 'Origem',     vowel: 'O' },
    { word: 'Orégano',    vowel: 'O' },
    { word: 'Oito',       vowel: 'O' },
    { word: 'Oitavo',     vowel: 'O' },
    { word: 'Ocupado',    vowel: 'O' },
    { word: 'Operário',   vowel: 'O' },
    { word: 'Oceano',     vowel: 'O' },
    { word: 'Objeto',     vowel: 'O' },
    { word: 'Ovelhinha',  vowel: 'O' },
    { word: 'Olhada',     vowel: 'O' },
    { word: 'Oásis',      vowel: 'O' },

    // ── VOGAL U (40 palavras simples do cotidiano) ──
    { word: 'Uva',        vowel: 'U' },
    { word: 'Urubu',      vowel: 'U' },
    { word: 'Urso',       vowel: 'U' },
    { word: 'Unha',       vowel: 'U' },
    { word: 'Uniforme',   vowel: 'U' },
    { word: 'Universo',   vowel: 'U' },
    { word: 'Urgência',   vowel: 'U' },
    { word: 'Último',     vowel: 'U' },
    { word: 'Usina',      vowel: 'U' },
    { word: 'Útil',       vowel: 'U' },
    { word: 'Urna',       vowel: 'U' },
    { word: 'Úmido',      vowel: 'U' },
    { word: 'Umbigo',     vowel: 'U' },
    { word: 'Umidade',    vowel: 'U' },
    { word: 'Unidade',    vowel: 'U' },
    { word: 'União',      vowel: 'U' },
    { word: 'Único',      vowel: 'U' },
    { word: 'Ursinho',    vowel: 'U' },
    { word: 'Urucum',     vowel: 'U' },
    { word: 'Uivar',      vowel: 'U' },
    { word: 'Umbu',       vowel: 'U' },
    { word: 'Urtiga',     vowel: 'U' },
    { word: 'Urgente',    vowel: 'U' },
    { word: 'Uso',        vowel: 'U' },
    { word: 'Usar',       vowel: 'U' },
    { word: 'Usado',      vowel: 'U' },
    { word: 'Urina',      vowel: 'U' },
    { word: 'Ungento',    vowel: 'U' },
    { word: 'Uruguai',    vowel: 'U' },
    { word: 'Unicórnio',  vowel: 'U' },
    { word: 'Urbano',     vowel: 'U' },
    { word: 'Ultra',      vowel: 'U' },
    { word: 'Uvaia',      vowel: 'U' },
    { word: 'Unificado',  vowel: 'U' },
    { word: 'Uivando',    vowel: 'U' },
    { word: 'Utensílio',  vowel: 'U' },
    { word: 'Upa',        vowel: 'U' },
    { word: 'Umbro',      vowel: 'U' },
    { word: 'Urgindo',    vowel: 'U' },
    { word: 'Umedecer',   vowel: 'U' }
];

var questions = [];
var currentIdx = 0;
var hits = 0;
var misses = 0;
var answered = false;
var errorLog = [];
var TOTAL = 10;

var allVowels = 'AEIOUÁÉÍÓÚÃÕÂÊÎÔÛaeiouáéíóúãõâêîôû';
var currentAudio = null;

/**
 * Função de Voz Infalível (Usa Áudio MP3 do Google TTS + Fallback da Web Speech API)
 */
export function speak(text, onEnd) {
    // Para qualquer áudio em reprodução
    if (currentAudio) {
        try {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        } catch (e) {}
    }

    if ('speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel();
        } catch (e) {}
    }

    // Tenta reprodução via áudio online em Português
    var googleTtsUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=' + encodeURIComponent(text);
    var audio = new Audio(googleTtsUrl);
    currentAudio = audio;

    var audioPlayedSuccess = false;

    audio.onended = function() {
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
    };

    audio.onerror = function() {
        // Se o áudio web falhar, ativa o sintetizador de voz nativo como plano B
        if (!audioPlayedSuccess) {
            speakNativo(text, onEnd);
        }
    };

    var playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(function() {
            audioPlayedSuccess = true;
        }).catch(function(err) {
            console.warn('Áudio web bloqueado, usando voz sintética nativa:', err);
            speakNativo(text, onEnd);
        });
    }
}

/**
 * Plano B: Síntese de Voz Nativa
 */
function speakNativo(text, onEnd) {
    if (!('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
    }

    try {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
    } catch (e) {}

    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = 0.85;
    u.pitch = 1.0;
    u.volume = 1.0;

    var voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
        var ptVoice = voices.find(function(v) {
            return v.lang === 'pt-BR' || v.lang === 'pt_BR' || v.lang.startsWith('pt');
        });
        if (ptVoice) u.voice = ptVoice;
    }

    u.onend = function() {
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
    };

    u.onerror = function() {
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(u);
}

function highlightFirstVowel(word) {
    for (var i = 0; i < word.length; i++) {
        if (allVowels.includes(word[i])) {
            return word.slice(0, i) +
                '<span class="vowel-highlight">' + word[i] + '</span>' +
                word.slice(i + 1);
        }
    }
    return word;
}

export function initExercise() {
    questions = shuffle([...wordBank]).slice(0, TOTAL);
    currentIdx = 0;
    hits = 0;
    misses = 0;
    answered = false;
    errorLog = [];
    
    var hitsEl = document.getElementById('hitsCount');
    var missesEl = document.getElementById('missesCount');
    var exLayout = document.getElementById('exerciseLayout');
    var cardEl = document.getElementById('exerciseCard');
    var compEl = document.getElementById('completionScreen');

    if (hitsEl) hitsEl.textContent = '0';
    if (missesEl) missesEl.textContent = '0';
    if (exLayout) exLayout.style.display = '';
    if (cardEl) cardEl.style.display = 'block';
    if (compEl) compEl.classList.remove('visible');

    loadQuestion();
}

export function loadQuestion() {
    answered = false;
    if (!questions[currentIdx]) return;
    var q = questions[currentIdx];
    
    var qWord = document.getElementById('questionWord');
    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var pLabel = document.getElementById('progressLabel');
    var fbArea = document.getElementById('feedbackArea');

    if (qWord) qWord.innerHTML = highlightFirstVowel(q.word);

    // Atualiza caixinha complementar de significado
    var mWordDisplay = document.getElementById('meaningWordDisplay');
    var mText = document.getElementById('meaningText');
    if (mWordDisplay) mWordDisplay.innerHTML = highlightFirstVowel(q.word);
    if (mText) {
        var meaning = q.meaning || wordMeanings[q.word] || ('Palavra simples iniciada com a letra ' + q.vowel + '.');
        mText.textContent = meaning;
    }

    var pct = (currentIdx / TOTAL) * 100;
    if (pFill) pFill.style.width = pct + '%';
    if (pBar) pBar.setAttribute('aria-valuenow', Math.round(pct));
    if (pLabel) pLabel.textContent = 'Pergunta ' + (currentIdx + 1) + ' de ' + TOTAL;
    if (fbArea) fbArea.innerHTML = '';

    document.querySelectorAll('.btn-option').forEach(function(btn) {
        btn.disabled = false;
        btn.classList.remove('correct', 'wrong');
    });
}

export function playMeaningAudio() {
    if (currentIdx >= questions.length) return;
    var btn = document.getElementById('btnMeaningAudio');
    if (btn) btn.classList.add('speaking');
    var q = questions[currentIdx];
    var word = q.word;
    var meaning = q.meaning || wordMeanings[word] || ('Palavra simples iniciada com a letra ' + q.vowel + '.');
    speak(word + '. ' + meaning, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

export function playQuestionAudio() {
    if (currentIdx >= questions.length) return;
    var btn = document.getElementById('btnExerciseAudio');
    if (btn) btn.classList.add('speaking');
    var word = questions[currentIdx].word;
    speak('Qual é a primeira vogal da palavra ' + word + '?', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

export function playHelpExercise() {
    var btn = document.getElementById('btnHelpExercise');
    if (btn) btn.classList.add('speaking');
    speak('Escolha a primeira vogal da palavra que aparece na tela.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

export function checkAnswer(selected) {
    if (answered) return;
    answered = true;
    var q = questions[currentIdx];
    var correct = selected === q.vowel;

    document.querySelectorAll('.btn-option').forEach(function(b) { b.disabled = true; });

    var selBtn = document.querySelector('.btn-option[data-vowel="' + selected + '"]');
    if (selBtn) selBtn.classList.add(correct ? 'correct' : 'wrong');

    if (!correct) {
        var correctBtn = document.querySelector('.btn-option[data-vowel="' + q.vowel + '"]');
        if (correctBtn) correctBtn.classList.add('correct');
        errorLog.push({ word: q.word, correctVowel: q.vowel, chosenVowel: selected });
    }

    if (correct) {
        hits++;
        var hitsEl = document.getElementById('hitsCount');
        if (hitsEl) hitsEl.textContent = hits;
        showFeedback('success', 'Muito bem!');
        speak('Muito bem!');
    } else {
        misses++;
        var missesEl = document.getElementById('missesCount');
        if (missesEl) missesEl.textContent = misses;
        showFeedback('error', 'Vamos tentar novamente.');
        speak('Vamos tentar novamente. A resposta era ' + q.vowel + '.');
    }

    announceSR(correct
        ? 'Muito bem! A resposta é ' + q.vowel + '.'
        : 'Vamos tentar novamente. A resposta era ' + q.vowel + '.'
    );

    var isLast = currentIdx >= TOTAL - 1;
    var label = isLast ? 'Ver resultado' : 'Próxima pergunta';
    var icon = isLast ? 'fa-flag-checkered' : 'fa-arrow-right';

    setTimeout(function() {
        var fbArea = document.getElementById('feedbackArea');
        if (fbArea) {
            fbArea.innerHTML +=
                '<button class="btn-next" onclick="window.nextQuestion()" aria-label="' + label + '">' +
                '<i class="fas ' + icon + '" aria-hidden="true"></i> ' + label + '</button>';
            var nb = document.querySelector('.btn-next');
            if (nb) nb.focus();
        }
    }, correct ? 200 : 800);
}

export function nextQuestion() {
    currentIdx++;
    if (currentIdx >= TOTAL) {
        showCompletion();
    } else {
        loadQuestion();
    }
}

function showFeedback(type, msg) {
    var icon = type === 'success' ? 'fa-check-circle' : 'fa-redo';
    var fbArea = document.getElementById('feedbackArea');
    if (fbArea) {
        fbArea.innerHTML =
            '<div class="feedback-msg ' + type + '" role="alert">' +
            '<i class="fas ' + icon + '" aria-hidden="true"></i> ' + msg + '</div>';
    }
}

export function showCompletion() {
    var exLayout = document.getElementById('exerciseLayout');
    var exCard = document.getElementById('exerciseCard');
    var compScreen = document.getElementById('completionScreen');
    if (exLayout) exLayout.style.display = 'none';
    var finalHitsEl = document.getElementById('finalHits');
    var finalMissesEl = document.getElementById('finalMisses');
    var finalTotalEl = document.getElementById('finalTotal');
    var progFill = document.getElementById('progressFill');

    if (exCard) exCard.style.display = 'none';
    if (compScreen) compScreen.classList.add('visible');
    if (finalHitsEl) finalHitsEl.textContent = hits;
    if (finalMissesEl) finalMissesEl.textContent = misses;
    if (finalTotalEl) finalTotalEl.textContent = TOTAL;
    if (progFill) progFill.style.width = '100%';

    var msg;
    if (hits === TOTAL) msg = 'Perfeito! Você acertou todas!';
    else if (hits >= 7) msg = 'Muito bom! Continue assim!';
    else if (hits >= 5) msg = 'Bom trabalho! Revise e tente de novo.';
    else msg = 'Não desista! Refaça e vai ficar melhor.';
    
    var compMsgEl = document.getElementById('completionMsg');
    if (compMsgEl) compMsgEl.textContent = msg;

    var errorSummaryEl = document.getElementById('errorSummary');
    var errorListEl = document.getElementById('errorList');
    if (errorListEl) errorListEl.innerHTML = '';

    if (errorLog.length > 0 && errorSummaryEl && errorListEl) {
        errorSummaryEl.style.display = 'block';
        errorLog.forEach(function(err) {
            var li = document.createElement('li');
            li.innerHTML = err.word +
                ' — você escolheu <span class="wrong-answer">' + err.chosenVowel + '</span>' +
                ' <span class="arrow"><i class="fas fa-arrow-right" aria-hidden="true"></i></span> ' +
                'o correto é <span class="correct-answer">' + err.correctVowel + '</span>';
            errorListEl.appendChild(li);
        });
    } else if (errorSummaryEl) {
        errorSummaryEl.style.display = 'none';
    }

    saveLessonProgress('vogais', { score: hits, total: TOTAL, misses: misses });

    speak('Parabéns! Você terminou! ' + msg);
    announceSR('Atividade concluída. ' + hits + ' acertos de ' + TOTAL + '. ' + msg);

    setTimeout(function() {
        var b = document.querySelector('.btn-restart');
        if (b) b.focus();
    }, 300);
}

export function restartExercise() { initExercise(); }

export function speakVowel(key) {
    var data = vowelData[key];
    if (!data) return;
    document.querySelectorAll('.vowel-card').forEach(function(c) { c.classList.remove('speaking'); });
    var card = document.querySelector('.vowel-card[data-vowel="' + key + '"]');
    if (card) card.classList.add('speaking');
    speak(data.letter + '. ' + data.letter + ' de ' + data.example + '.', function() {
        if (card) card.classList.remove('speaking');
    });
}

export function playInstruction() {
    var btn = document.getElementById('btnInstruction');
    if (btn) btn.classList.add('speaking');
    speak('Ouça e repita cada vogal, toque nas fotos para ouvir as vogais.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

export function announceSR(text) {
    var el = document.getElementById('srAnnouncer');
    if (el) {
        el.textContent = '';
        setTimeout(function() { el.textContent = text; }, 60);
    }
}

function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

export function toggleMenu() {
    var menu = document.getElementById('mobileMenu');
    var btn = document.querySelector('.navbar-hamburger');
    if (menu && btn) {
        var isOpen = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
    }
}

// Vincula funções ao window
window.speak = speak;
window.speakVowel = speakVowel;
window.playInstruction = playInstruction;
window.playQuestionAudio = playQuestionAudio;
window.playHelpExercise = playHelpExercise;
window.playMeaningAudio = playMeaningAudio;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.restartExercise = restartExercise;
window.toggleMenu = toggleMenu;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExercise);
} else {
    initExercise();
}