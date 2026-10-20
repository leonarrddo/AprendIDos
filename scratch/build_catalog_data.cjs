const fs = require('fs');
const path = require('path');

const wordDictionary = {
  A: {
    soundText: "Letra A. Veja as palavras que começam com a letra A.",
    lots: [
      [
        { word: "AVIÃO", syllables: "A - VI - Ã - O", desc: "Meio de transporte que voa alto pelo céu e leva as pessoas para cidades e países distantes com rapidez e segurança.", img: "imagenspalavras/aviao.jpg", icon: "fa-plane" },
        { word: "ÁGUA", syllables: "Á - GUA", desc: "Líquido transparente e essencial para a vida, usado para beber, preparar alimentos, tomar banho e manter a saúde.", img: "imagenspalavras/agua.jpg", icon: "fa-glass-water" },
        { word: "ANEL", syllables: "A - NEL", desc: "Joia redonda que usamos no dedo como enfeite ou símbolo de compromisso, união e carinho.", img: "imagenspalavras/anel.jpg", icon: "fa-ring" },
        { word: "ÁRVORE", syllables: "ÁR - VO - RE", desc: "Planta grande com tronco forte e copa cheia de folhas que nos dá sombra fresca, ar puro e frutos saborosos.", img: "imagenspalavras/arvore.jpg", icon: "fa-tree" }
      ],
      [
        { word: "ARROZ", syllables: "AR - ROZ", desc: "Alimento muito tradicional e nutritivo no prato dos brasileiros, servido quentinho acompanhado de um bom feijão.", img: "imagenspalavras/arroz.jpg", icon: "fa-bowl-rice" },
        { word: "ALHO", syllables: "A - LHO", desc: "Tempero saudável e muito aromático que usamos amassadinho na panela para dar um sabor especial à comida de casa.", img: "imagenspalavras/alho.jpg", icon: "fa-cubes-stacked" },
        { word: "ABACAXI", syllables: "A - BA - CA - XI", desc: "Fruta tropical suculenta com casca dourada e coroa de folhas, muito doce e ótima para sobremesa ou suco.", img: "imagenspalavras/abacaxi.jpeg", icon: "fa-seedling" },
        { word: "ARARA", syllables: "A - RA - RA", desc: "Ave brasileira muito bonita e colorida, de bico curvo e penas vistosas, que vive nas florestas do nosso país.", img: "imagenspalavras/arara.jpg", icon: "fa-feather" }
      ]
    ]
  },
  B: {
    soundText: "Letra B. Veja as palavras que começam com a letra B.",
    lots: [
      [
        { word: "BOLA", syllables: "BO - LA", desc: "Objeto redondo muito usado em brincadeiras de criança e esportes queridos, como o futebol de domingo.", img: "capaletras/Cartão educativo B de Bola.png", icon: "fa-futbol" },
        { word: "BOLO", syllables: "BO - LO", desc: "Doce fofinho e delicioso assado no forno, perfeito para comemorar aniversários e tomar com um bom café da tarde.", img: "imagenspalavras/bolo.jpg", icon: "fa-cake-candles" },
        { word: "BANANA", syllables: "BA - NA - NA", desc: "Fruta macia, doce e muito saudável, fácil de descascar e cheia de energia para o dia a dia.", img: "imagenspalavras/banana.jpg", icon: "fa-lemon" },
        { word: "BALÃO", syllables: "BA - LÃO", desc: "Bexiga colorida inflada com ar, usada para enfeitar festas infantis e alegrar comemorações com a família.", img: "imagenspalavras/balao.jpg", icon: "fa-circle" }
      ],
      [
        { word: "BATATA", syllables: "BA - TA - TA", desc: "Alimento gostoso colhido na terra, que podemos preparar cozido, frito ou em um purê bem macio e quentinho.", img: "imagenspalavras/batata.jpg", icon: "fa-cubes" },
        { word: "BOCA", syllables: "BO - CA", desc: "Parte do rosto com a qual conversamos, cantamos músicas queridas, damos sorrisos e saboreamos a comida.", img: "imagenspalavras/boca.jpg", icon: "fa-face-smile" },
        { word: "BALDE", syllables: "BAL - DE", desc: "Recipiente fundo com alça, muito útil na limpeza da casa, para regar plantas e carregar água com facilidade.", img: "imagenspalavras/balde.jpg", icon: "fa-bucket" },
        { word: "BARCO", syllables: "BAR - CO", desc: "Meio de transporte que navega sobre as águas de rios, lagos e mares para passeios, pescarias e viagens.", img: "imagenspalavras/barco.jpg", icon: "fa-ship" }
      ]
    ]
  },
  C: {
    soundText: "Letra C. Veja as palavras que começam com a letra C.",
    lots: [
      [
        { word: "CASA", syllables: "CA - SA", desc: "Nosso lar acolhedor, onde descansamos com tranquilidade e vivemos momentos felizes com quem amamos.", img: "capaletras/Cartaz educativo da letra C com casa.png", icon: "fa-house" },
        { word: "COPO", syllables: "CO - PO", desc: "Utensílio simples que usamos todos os dias para beber água fresca, suco de frutas, leite ou chá.", img: "imagenspalavras/copo.jpg", icon: "fa-wine-glass" },
        { word: "CAMA", syllables: "CA - MA", desc: "Móvel macio com travesseiro e cobertor onde deitamos para repousar o corpo e ter uma boa noite de sono.", img: "imagenspalavras/cama.jpg", icon: "fa-bed" },
        { word: "CAFÉ", syllables: "CA - FÉ", desc: "Bebida quente, cheirosa e tradicional do Brasil, indispensável ao acordar e para receber visitas com carinho.", img: "imagenspalavras/cafe.jpg", icon: "fa-mug-saucer" }
      ],
      [
        { word: "CARRO", syllables: "CAR - RO", desc: "Veículo com quatro rodas e motor que conduz a família com comodidade pela cidade e pelas estradas.", img: "imagenspalavras/carro.png", icon: "fa-car" },
        { word: "CANETA", syllables: "CA - NE - TA", desc: "Instrumento com ponta e tinta que usamos para escrever recados, cartas e assinar documentos importantes.", img: "imagenspalavras/caneta.jpg", icon: "fa-pen" },
        { word: "COLHER", syllables: "CO - LHER", desc: "Talher arredondado que usamos à mesa para tomar sopa, saborear sobremesas e misturar receitas na panela.", img: "imagenspalavras/colher.jpg", icon: "fa-utensils" },
        { word: "CAVALO", syllables: "CA - VA - LO", desc: "Animal nobre, dócil e forte que ajuda nos trabalhos do campo e nos passeios tranquilos pelas trilhas.", img: "imagenspalavras/cavalo.jpg", icon: "fa-horse" }
      ]
    ]
  },
  D: {
    soundText: "Letra D. Veja as palavras que começam com a letra D.",
    lots: [
      [
        { word: "DADO", syllables: "DA - DO", desc: "Pequeno cubo com pontinhos marcados de um a seis, usado para jogar e se divertir com jogos de tabuleiro.", img: "capaletras/Cartão Educativo da Letra D.png", icon: "fa-dice" },
        { word: "DEDO", syllables: "DE - DO", desc: "Parte móvel das mãos e dos pés que nos permite tocar, sentir texturas, segurar objetos e apontar coisas.", img: "imagenspalavras/dedo.jpg", icon: "fa-hand" },
        { word: "DOCE", syllables: "DO - CE", desc: "Sobremesa ou guloseima açucarada, como brigadeiro, compota de frutas ou pudim que adoça o nosso dia.", img: "imagenspalavras/doce.jpg", icon: "fa-candy-cane" },
        { word: "DENTE", syllables: "DEN - TE", desc: "Parte firme e esbranquiçada da boca que serve para mastigar os alimentos e deixar nosso sorriso bonito.", img: "imagenspalavras/dente.jpg", icon: "fa-tooth" }
      ],
      [
        { word: "DINHEIRO", syllables: "DI - NHEI - RO", desc: "Notas e moedas que usamos para pagar compras, serviços, feira e cuidar das despesas da nossa família.", img: "imagenspalavras/dinheiro.jpg", icon: "fa-money-bill-wave" },
        { word: "DIA", syllables: "DI - A", desc: "Período do sol, que começa na claridade da manhã e vai até o entardecer, cheio de vida e atividades.", img: "imagenspalavras/dia.jpg", icon: "fa-sun" },
        { word: "DOMINÓ", syllables: "DO - MI - NÓ", desc: "Jogo tradicional de peças retangulares com pontinhos, jogado sobre a mesa entre amigos e familiares.", img: "imagenspalavras/domino.jpg", icon: "fa-square" },
        { word: "DOCUMENTO", syllables: "DO - CU - MEN - TO", desc: "Papel oficial de identificação pessoal, como a carteira de identidade e certidões que garantem nossos direitos.", img: "imagenspalavras/documento.jpg", icon: "fa-file-lines" }
      ]
    ]
  },
  E: {
    soundText: "Letra E. Veja as palavras que começam com a letra E.",
    lots: [
      [
        { word: "ESCADA", syllables: "ES - CA - DA", desc: "Estrutura com degraus firmes que nos permite subir e descer entre andares ou alcançar lugares altos.", img: "imagenspalavras/escada.jpg", icon: "fa-bars-staggered" },
        { word: "ESCOVA", syllables: "ES - CO - VA", desc: "Objeto com cerdas macias usado todos os dias para escovar os dentes ou pentear o cabelo com capricho.", img: "imagenspalavras/escova.jpg", icon: "fa-teeth" },
        { word: "ESPELHO", syllables: "ES - PE - LHO", desc: "Vidro prateado brilhante que reflete a nossa imagem para nos arrumarmos e vermos como estamos bem.", img: "imagenscartilha/e.png", icon: "fa-square" },
        { word: "ESTRELA", syllables: "ES - TRE - LA", desc: "Ponto brilhante que ilumina o céu noturno, enchendo a noite escura de luz, beleza e poesia.", img: "imagenspalavras/estrela.jpeg", icon: "fa-star" }
      ],
      [
        { word: "ESPONJA", syllables: "ES - PON - JA", desc: "Material macio e que absorve água e sabão, muito usado na pia da cozinha para lavar pratos e panelas.", img: "imagenspalavras/esponja.jpg", icon: "fa-soap" },
        { word: "ENVELOPE", syllables: "EN - VE - LO - PE", desc: "Capa de papel dobrada que protege cartas, cartões de boas festas e contas a serem entregues pelo correio.", img: "imagenspalavras/envelope.jpg", icon: "fa-envelope" },
        { word: "ELEFANTE", syllables: "E - LE - FAN - TE", desc: "Animal grandioso, calmo e simpático, famoso por suas orelhas compridas e longa tromba com que bebe água.", img: "imagenspalavras/elefante.jpg", icon: "fa-paw" },
        { word: "ESCOLA", syllables: "ES - CO - LA", desc: "Lugar de carinho e aprendizado, onde encontramos professores dedicados para aprender a ler, escrever e crescer.", img: "imagenspalavras/escola.png", icon: "fa-school" }
      ]
    ]
  },
  F: {
    soundText: "Letra F. Veja as palavras que começam com a letra F.",
    lots: [
      [
        { word: "FACA", syllables: "FA - CA", desc: "Talher afiado com cabo que usamos na cozinha e à mesa para cortar pães, carnes e legumes com cuidado.", img: "imagenspalavras/faca.jpg", icon: "fa-utensils" },
        { word: "FOGO", syllables: "FO - GO", desc: "Chama quente e luminosa que aquece a casa, produz calor e serve no fogão para preparar refeições gostosas.", img: "imagenspalavras/fogo.jpg", icon: "fa-fire" },
        { word: "FLOR", syllables: "FLOR", desc: "Parte colorida e perfumada das plantas que embeleza os vasos, alegra os jardins e enfeita a nossa casa.", img: "imagenspalavras/flor.jpg", icon: "fa-sun" },
        { word: "FEIJÃO", syllables: "FEI - JÃO", desc: "Grão saboroso e rico em ferro que forma a dupla perfeita e indispensável com o arroz na mesa brasileira.", img: "imagenspalavras/feijao.jpg", icon: "fa-bowl-food" }
      ],
      [
        { word: "FITA", syllables: "FI - TA", desc: "Tira fina de tecido ou plástico usada para laços de presente, costuras ou prender curativos na pele.", img: "imagenspalavras/fita.jpg", icon: "fa-tape" },
        { word: "FOGÃO", syllables: "FO - GÃO", desc: "Aparelho do coração da cozinha onde acendemos as chamas para cozinhar o almoço e assar bolos no forno.", img: "imagenspalavras/fogao.png", icon: "fa-fire-burner" },
        { word: "FRUTA", syllables: "FRU - TA", desc: "Alimento fresco, doce e natural que nasce nas plantas, cheio de vitaminas e excelente para a saúde.", img: "imagenspalavras/fruta.jpg", icon: "fa-apple-whole" },
        { word: "FOLHA", syllables: "FO - LHA", desc: "Parte verdinha das árvores e plantas que capta a luz do sol e renova o ar puro que respiramos.", img: "imagenspalavras/folha.jpg", icon: "fa-leaf" }
      ]
    ]
  },
  G: {
    soundText: "Letra G. Veja as palavras que começam com a letra G.",
    lots: [
      [
        { word: "GATO", syllables: "GA - TO", desc: "Bichinho de estimação ágil, carinhoso e dócil, que gosta de ronronar no colo e fazer companhia em casa.", img: "imagenspalavras/gato.jpg", icon: "fa-cat" },
        { word: "GARFO", syllables: "GAR - FO", desc: "Talher de metal com dentes que usamos para pegar a comida do prato com firmeza e educação.", img: "imagenspalavras/garfo.png", icon: "fa-utensils" },
        { word: "GARRAFA", syllables: "GAR - RA - FA", desc: "Recipiente com tampa onde guardamos líquidos frescos na geladeira, como água filtrada e suco natural.", img: "imagenspalavras/garrafa.png", icon: "fa-bottle-water" },
        { word: "GALINHA", syllables: "GA - LI - NHA", desc: "Ave do sítio e do quintal que cacareja logo cedo e nos fornece ovos nutritivos e fresquinhos.", img: "imagenspalavras/galinha.jpg", icon: "fa-egg" }
      ],
      [
        { word: "GAVETA", syllables: "GA - VE - TA", desc: "Caixa corrediça de armários e cômodas onde organizamos roupas dobradas, toalhas e objetos de valor.", img: "imagenspalavras/gaveta.jpg", icon: "fa-box" },
        { word: "GELO", syllables: "GE - LO", desc: "Água congelada em cubinhos que usamos para deixar o copo de suco bem geladinho nos dias de calor.", img: "imagenspalavras/gelo.jpg", icon: "fa-snowflake" },
        { word: "GIRAFA", syllables: "GI - RA - FA", desc: "Animal muito alto e gracioso, que se destaca na natureza pelo pescoço longo e manchas castanhas.", img: "imagenspalavras/girafa.jpg", icon: "fa-paw" },
        { word: "GELEIA", syllables: "GE - LEI - A", desc: "Doce pastoso feito com frutas bem cozidas e açúcar, maravilhoso para passar no pãozinho fresco.", img: "imagenspalavras/geleia.jpg", icon: "fa-jar" }
      ]
    ]
  },
  H: {
    soundText: "Letra H. Veja as palavras que começam com a letra H.",
    lots: [
      [
        { word: "HOMEM", syllables: "HO - MEM", desc: "Pessoa adulta do sexo masculino; cidadão trabalhador que convive com respeito na família e na sociedade.", img: "imagenspalavras/homem.png", icon: "fa-person" },
        { word: "HORA", syllables: "HO - RA", desc: "Medida do tempo marcada pelos ponteiros do relógio para sabermos a hora do almoço, do remédio e de dormir.", img: "imagenspalavras/hora.jpg", icon: "fa-clock" },
        { word: "HOSPITAL", syllables: "HOS - PI - TAL", desc: "Lugar de cuidado e cura onde médicos e enfermeiros dedicados cuidam da nossa saúde com atenção.", img: "imagenspalavras/hospital.jpg", icon: "fa-hospital" },
        { word: "HAMBÚRGUER", syllables: "HAM - BÚR - GUER", desc: "Lanche saboroso feito com pão fofinho, carne grelhada, fatia de queijo e salada que todos adoram.", img: "imagenspalavras/hamburguer.jpg", icon: "fa-burger" }
      ],
      [
        { word: "HORTA", syllables: "HOR - TA", desc: "Canteiro de terra fofa no quintal onde plantamos alface, couve, cebolinha e cheiro-verde sem agrotóxicos.", img: "imagenspalavras/horta.jpg", icon: "fa-seedling" },
        { word: "HELICÓPTERO", syllables: "HE - LI - CÓP - TE - RO", desc: "Aeronave com grandes hélices giratórias no teto, que consegue voar, pairar no ar e pousar em espaços pequenos.", img: "imagenspalavras/helicoptero.jpg", icon: "fa-helicopter" },
        { word: "HOTEL", syllables: "HO - TEL", desc: "Estabelecimento confortável e seguro que oferece quartos arrumados para quem viaja descansar à noite.", img: "imagenspalavras/hotel.jpg", icon: "fa-hotel" },
        { word: "HARPA", syllables: "HAR - PA", desc: "Instrumento musical nobre de cordas tocado com os dedos, que produz melodias suaves e angelicais.", img: "imagenspalavras/harpa.jpg", icon: "fa-music" }
      ]
    ]
  },
  I: {
    soundText: "Letra I. Veja as palavras que começam com a letra I.",
    lots: [
      [
        { word: "IGREJA", syllables: "I - GRE - JA", desc: "Templo sagrado de fé, oração e comunhão onde as pessoas se reúnem para agradecer e encontrar paz.", img: "imagenspalavras/igreja.jpg", icon: "fa-church" },
        { word: "ILHA", syllables: "I - LHA", desc: "Porção de terra bonita e cercada por água por todos os lados, com praias e coqueiros tranquilos.", img: "imagenspalavras/ilha.jpg", icon: "fa-umbrella-beach" },
        { word: "IOIÔ", syllables: "I - OI - Ô", desc: "Brinquedo clássico feito de dois discos presos a um barbante que sobe e desce com o balanço da mão.", img: "imagenspalavras/ioio.png", icon: "fa-circle-dot" },
        { word: "IOGURTE", syllables: "IO - GUR - TE", desc: "Alimento cremoso e saudável feito com leite fermentado, muito saboroso para comer com frutas no café.", img: "imagenspalavras/iogurte.jpg", icon: "fa-bowl-rice" }
      ],
      [
        { word: "ÍMÃ", syllables: "Í - MÃ", desc: "Objeto de metal com força magnética que gruda no ferro, muito usado na porta da geladeira para prender lembretes.", img: "imagenspalavras/ima.jpg", icon: "fa-magnet" },
        { word: "INJEÇÃO", syllables: "IN - JE - ÇÃO", desc: "Aplicação de remédio ou vacina com agulha fina para prevenir doenças e restabelecer a nossa saúde rapidamente.", img: "imagenspalavras/injecao.jpg", icon: "fa-syringe" },
        { word: "IRMÃO", syllables: "IR - MÃO", desc: "Parente muito próximo, companheiro de vida e de infância, com quem compartilhamos laços de sangue e amor.", img: "imagenspalavras/irmao.png", icon: "fa-people-group" },
        { word: "INVERNO", syllables: "IN - VER - NO", desc: "A estação mais fresca e fria do ano, ótima para vestir agasalhos quentes e tomar uma sopa quentinha.", img: "imagenspalavras/inverno.jpg", icon: "fa-snowflake" }
      ]
    ]
  },
  J: {
    soundText: "Letra J. Veja as palavras que começam com a letra J.",
    lots: [
      [
        { word: "JANELA", syllables: "JA - NE - LA", desc: "Abertura com vidros na parede de casa que permite entrar a luz brilhante do sol e a brisa fresca da manhã.", img: "imagenspalavras/janela.png", icon: "fa-border-all" },
        { word: "JOGO", syllables: "JO - GO", desc: "Brincadeira animada com regras para reunir a família, exercitar o raciocínio e dar muitas risadas.", img: "imagenspalavras/jogo.png", icon: "fa-gamepad" },
        { word: "JARDIM", syllables: "JAR - DIM", desc: "Cantinho florido e verde perto da casa onde cuidamos de rosas, margaridas e folhagens perfumadas.", img: "imagenspalavras/jardim.jpg", icon: "fa-tree" },
        { word: "JACARÉ", syllables: "JA - CA - RÉ", desc: "Grande réptil de couro forte que vive nas lagoas e rios brasileiros, tomando banho de sol na beirada da água.", img: "imagenspalavras/jacare.jpg", icon: "fa-dragon" }
      ],
      [
        { word: "JARRA", syllables: "JAR - RA", desc: "Vasilha com bico e asa usada para servir água gelada, suco de frutas frescas e refrescos à mesa.", img: "imagenspalavras/jarra.jpg", icon: "fa-glass-water" },
        { word: "JORNAL", syllables: "JOR - NAL", desc: "Folhas impressas com reportagens, notícias e artigos para mantermos a mente ativa e ficarmos bem informados.", img: "imagenspalavras/jornal.jpg", icon: "fa-newspaper" },
        { word: "JAQUETA", syllables: "JA - QUE - TA", desc: "Casaco confortável de mangas compridas e zíper que colocamos para nos proteger do vento e do sereno.", img: "imagenspalavras/jaqueta.png", icon: "fa-vest" },
        { word: "JOIA", syllables: "JOI - A", desc: "Peça preciosa feita de ouro, prata ou pedras brilhantes, usada para se enfeitar em momentos marcantes.", img: "imagenspalavras/joia.jpeg", icon: "fa-gem" }
      ]
    ]
  },
  K: {
    soundText: "Letra K. Veja as palavras que começam com a letra K.",
    lots: [
      [
        { word: "KIWI", syllables: "KI - WI", desc: "Frutinha arredondada de casca aveludada marrom e polpa verde com sementinhas pretas, rica em vitamina C.", img: "capaletras/Cartaz Infantil da Letra K com Kiwi.png", icon: "fa-lemon" },
        { word: "KETCHUP", syllables: "KET - CHUP", desc: "Molho vermelho adocicado feito à base de tomates cozidos, muito gostoso em lanches, pastéis e batatas.", img: "imagenspalavras/ketchup.png", icon: "fa-bottle-droplet" },
        { word: "KIMONO", syllables: "KI - MO - NO", desc: "Roupa tradicional resistente usada na prática respeitosa de artes marciais como o judô e o karatê.", img: "imagenspalavras/kimono.png", icon: "fa-shirt" },
        { word: "KARATÊ", syllables: "KA - RA - TÊ", desc: "Arte marcial japonesa que ensina disciplina, postura, respeito ao próximo e fortalecimento do corpo.", img: "imagenspalavras/karate.jpg", icon: "fa-hand-back-fist" }
      ],
      [
        { word: "KART", syllables: "KART", desc: "Pequeno veículo de quatro rodas sem teto, usado para corridas recreativas em pistas fechadas de lazer.", img: "imagenspalavras/kart.jpg", icon: "fa-car" },
        { word: "KARAOKÊ", syllables: "KA - RA - O - KÊ", desc: "Momento musical festivo onde pegamos o microfone para cantar nossas músicas do coração lendo a letra.", img: "imagenspalavras/karaoke.png", icon: "fa-microphone" },
        { word: "KILO", syllables: "KI - LO", desc: "Unidade de peso comum que usamos na balança do mercado para pesar frutas, verduras, feijão e carnes.", img: "imagenspalavras/kilo.jpg", icon: "fa-scale-balanced" },
        { word: "KOMBI", syllables: "KOM - BI", desc: "Veículo clássico e espaçoso muito querido pelos brasileiros, parceiro de feirantes e famílias em viagens.", img: "imagenspalavras/kombi.jpg", icon: "fa-van-shuttle" }
      ]
    ]
  },
  L: {
    soundText: "Letra L. Veja as palavras que começam com a letra L.",
    lots: [
      [
        { word: "LÁPIS", syllables: "LÁ - PIS", desc: "Instrumento de madeira com ponta de grafite que usamos para treinar a caligrafia, escrever recados e desenhar.", img: "imagenspalavras/lapis.jpg", icon: "fa-pencil" },
        { word: "LIVRO", syllables: "LI - VRO", desc: "Tesouro de páginas com histórias, memórias e ensinamentos que abrem portas para novas descobertas na vida.", img: "imagenspalavras/livro.jpg", icon: "fa-book" },
        { word: "LARANJA", syllables: "LA - RAN - JA", desc: "Fruta redonda e suculenta muito comum no Brasil, excelente para descascar na faca e fazer suco gostoso.", img: "imagenspalavras/laranja.jpg", icon: "fa-lemon" },
        { word: "LUA", syllables: "LU - A", desc: "Lindo astro prateado que surge no céu à noite, iluminando a terra com suas fases crescente e cheia.", img: "capaletras/Cartaz Infantil da Letra L e da Lua.png", icon: "fa-moon" }
      ],
      [
        { word: "LIXO", syllables: "LI - XO", desc: "Materiais que já foram usados e que descartamos na lixeira com consciência para manter a casa limpa e reciclar.", img: "imagenspalavras/lixo.jpg", icon: "fa-trash" },
        { word: "LEITE", syllables: "LEI - TE", desc: "Bebida branca e nutritiva, rica em cálcio para os ossos, excelente puro ou misturado no café matinal.", img: "imagenspalavras/leite.jpg", icon: "fa-bottle-water" },
        { word: "LÂMPADA", syllables: "LÂM - PA - DA", desc: "Objeto de vidro que acendemos no interruptor para clarear os cômodos da casa quando o sol se põe.", img: "imagenspalavras/lamapda.jpg", icon: "fa-lightbulb" },
        { word: "LEÃO", syllables: "LE - Ã O", desc: "Grande felino de juba imponente, conhecido pela sua coragem e por ser o rei dos animais na savana.", img: "imagenspalavras/leao.jpg", icon: "fa-paw" }
      ]
    ]
  },
  M: {
    soundText: "Letra M. Veja as palavras que começam com a letra M.",
    lots: [
      [
        { word: "MESA", syllables: "ME - SA", desc: "Móvel firme e plano de madeira onde a família se senta unida para compartilhar as refeições com alegria.", img: "imagenspalavras/mesa.jpg", icon: "fa-table" },
        { word: "MAÇÃ", syllables: "MA - ÇÃ", desc: "Fruta vermelinha, redonda e crocante, cheia de caldo doce, muito prática para levar na bolsa e lanchar.", img: "imagenspalavras/maca.jpg", icon: "fa-apple-whole" },
        { word: "MALA", syllables: "MA - LA", desc: "Bolsa resistente com zíper e rodinhas onde guardamos roupas passadas e pertences para passear e viajar.", img: "imagenspalavras/mala.jpg", icon: "fa-suitcase-rolling" },
        { word: "MEIA", syllables: "MEI - A", desc: "Peça de tecido macio que calçamos nos pés antes do sapato para mantê-los quentinhos e confortáveis.", img: "imagenspalavras/meia.jpg", icon: "fa-socks" }
      ],
      [
        { word: "MAMÃO", syllables: "MA - MÃO", desc: "Fruta brasileira de polpa laranja suave e sementinhas pretas, famosa por fazer muito bem para a digestão.", img: "imagenspalavras/mamao.jpg", icon: "fa-lemon" },
        { word: "MILHO", syllables: "MI - LHO", desc: "Grão amarelo colhido na espiga, ingrediente maravilhoso de pamonhas, bolos caseiros, curau e pipoca.", img: "imagenspalavras/milho.jpg", icon: "fa-wheat-awn" },
        { word: "MOTO", syllables: "MO - TO", desc: "Veículo de duas rodas ágil e econômico, muito utilizado no trânsito das cidades para trabalhar e passear.", img: "imagenspalavras/moto.jpg", icon: "fa-motorcycle" },
        { word: "MACACO", syllables: "MA - CA - CO", desc: "Bichinho simpático, ágil e esperto que vive pulando de galho em galho pelas matas do nosso Brasil.", img: "imagenspalavras/macaco.jpg", icon: "fa-paw" }
      ]
    ]
  },
  N: {
    soundText: "Letra N. Veja as palavras que começam com a letra N.",
    lots: [
      [
        { word: "NAVIO", syllables: "NA - VI - O", desc: "Embarcação gigante que viaja pelos oceanos levando cargas pesadas e milhares de viajantes pelo mar.", img: "capaletras/Cartão Educativo da Letra N com Navio.png", icon: "fa-ship" },
        { word: "NUVEM", syllables: "NU - VEM", desc: "Algodão branco formado por gotículas de água que flutua no céu azul e nos presenteia com a chuva.", img: "imagenspalavras/nuvem.jpg", icon: "fa-cloud" },
        { word: "NINHO", syllables: "NI - NHO", desc: "Abrigo quentinho feito de gravetos e folhas onde os passarinhos chocam ovos e criam seus filhotes.", img: "imagenspalavras/ninho.jpg", icon: "fa-egg" },
        { word: "NOITE", syllables: "NOI - TE", desc: "Momento silencioso em que as estrelas brilham no céu e nos recolhemos para dormir e renovar as forças.", img: "imagenspalavras/noite.jpg", icon: "fa-moon" }
      ],
      [
        { word: "NARIZ", syllables: "NA - RIZ", desc: "Parte do rosto por onde respiramos o ar fresco e sentimos o cheirinho gostoso do café e das flores.", img: "imagenspalavras/nariz.jpg", icon: "fa-face-smile" },
        { word: "NOZ", syllables: "NOZ", desc: "Fruto seco com casca durinha e miolo crocante muito gostoso, rico em nutrientes para a memória.", img: "imagenspalavras/noz.jpg", icon: "fa-seedling" },
        { word: "NEVE", syllables: "NE - VE", desc: "Flocos macios de gelo branquinho que caem suavemente do céu nos dias de frio muito intenso.", img: "imagenspalavras/neve.jpg", icon: "fa-snowflake" },
        { word: "NÚMERO", syllables: "NÚ - ME - RO", desc: "Símbolo que usamos para contar coisas, ver os preços na feira, olhar o relógio e discar no telefone.", img: "imagenspalavras/numero.png", icon: "fa-hashtag" }
      ]
    ]
  },
  O: {
    soundText: "Letra O. Veja as palavras que começam com a letra O.",
    lots: [
      [
        { word: "OVO", syllables: "O - VO", desc: "Alimento simples, versátil e nutritivo posto pela galinha, com gema dourada para fritar, cozer ou pôr em receitas.", img: "capaletras/Cartaz Educativo da Letra O com Ovo.png", icon: "fa-egg" },
        { word: "ÓCULOS", syllables: "Ó - CU - LOS", desc: "Acessório com lentes claras que colocamos no rosto para enxergar com nitidez, ler letras e ver de perto.", img: "imagenspalavras/oculos.jpg", icon: "fa-glasses" },
        { word: "OLHO", syllables: "O - LHO", desc: "Órgão abençoado da visão que nos permite admirar as belezas da vida e enxergar as pessoas queridas.", img: "imagenspalavras/olho.jpg", icon: "fa-eye" },
        { word: "ORELHA", syllables: "O - RE - LHA", desc: "Parte do corpo que capta as palavras carinhosas, os sons do rádio e as conversas da família.", img: "imagenspalavras/orelha.jpg", icon: "fa-ear-listen" }
      ],
      [
        { word: "OURO", syllables: "OU - RO", desc: "Metal precioso e brilhante de tom amarelado, muito valorizado e usado na fabricação de alianças e joias.", img: "imagenspalavras/ouro.jpg", icon: "fa-coins" },
        { word: "ÔNIBUS", syllables: "Ô - NI - BUS", desc: "Meio de transporte coletivo grande que conduz os passageiros com segurança pelos bairros da cidade.", img: "imagenspalavras/onibus.jpg", icon: "fa-bus" },
        { word: "ONÇA", syllables: "ON - ÇA", desc: "Belo felino pintado das nossas matas, símbolo da força e da riqueza da natureza do Brasil.", img: "imagenspalavras/onca.jpg", icon: "fa-paw" },
        { word: "OVELHA", syllables: "O - VE - LHA", desc: "Animal dócil criado no campo, com corpo coberto de lã quentinha usada para tecer mantas e agasalhos.", img: "imagenspalavras/ovelha.jpg", icon: "fa-sheep" }
      ]
    ]
  },
  P: {
    soundText: "Letra P. Veja as palavras que começam com a letra P.",
    lots: [
      [
        { word: "PÃO", syllables: "PÃO", desc: "Alimento sagrado assado com farinha e fermento, quentinho com manteiga derretida no café matinal.", img: "imagenspalavras/pao.jpg", icon: "fa-bread-slice" },
        { word: "PRATO", syllables: "PRA - TO", desc: "Peça de louça redonda onde servimos a refeição saborosa com capricho na hora do almoço em família.", img: "imagenspalavras/prato.jpg", icon: "fa-circle" },
        { word: "PORTA", syllables: "POR - TA", desc: "Entrada da casa que abrimos para acolher visitas queridas e fechamos para ter sossego e segurança.", img: "imagenspalavras/porta.png", icon: "fa-door-closed" },
        { word: "PANELA", syllables: "PA - NE - LA", desc: "Utensílio de metal com alças onde borbulha o feijão e cozinham as melhores receitas de família no fogão.", img: "imagenspalavras/panela.jpg", icon: "fa-kitchen-set" }
      ],
      [
        { word: "PIZZA", syllables: "PIZ - ZA", desc: "Massa redonda assada no forno com queijo derretido, molho de tomate e orégano, adorada em noites de reunião.", img: "imagenspalavras/pizza.jpg", icon: "fa-pizza-slice" },
        { word: "PEIXE", syllables: "PEI - XE", desc: "Animal que nada ligeiro nos rios e no mar, fornecendo uma carne leve, saudável e muito nutritiva.", img: "imagenspalavras/peixe.jpg", icon: "fa-fish" },
        { word: "PIPOCA", syllables: "PI - PO - CA", desc: "Grão de milho que estoura no fundo da panela quente virando flocos branquinhos e crocantes para lanchar.", img: "imagenspalavras/pipoca.jpg", icon: "fa-bowl-rice" },
        { word: "PATO", syllables: "PA - TO", desc: "Ave aquática com penas impermeáveis e bico achatado que adora nadar e mergulhar nas lagoas.", img: "imagenspalavras/pato.jpg", icon: "fa-feather" }
      ]
    ]
  },
  Q: {
    soundText: "Letra Q. Veja as palavras que começam com a letra Q.",
    lots: [
      [
        { word: "QUEIJO", syllables: "QUEI - JO", desc: "Alimento saboroso derivado do leite, delicioso fatiado no pão francês, com goiabada ou no cafezinho.", img: "imagenspalavras/queijo.jpeg", icon: "fa-cheese" },
        { word: "QUADRO", syllables: "QUA - DRO", desc: "Moldura bonita com uma pintura ou foto de recordação que penduramos na parede para decorar o lar.", img: "imagenspalavras/quadro.jpg", icon: "fa-image" },
        { word: "QUARTO", syllables: "QUAR - TO", desc: "Cômodo aconchegante da casa reservado para o nosso descanso, onde fica a cama, o armário e o silêncio.", img: "imagenspalavras/quarto.jpg", icon: "fa-bed" },
        { word: "QUINTAL", syllables: "QUIN - TAL", desc: "Área aberta atrás da casa onde tomamos um ar fresco, cuidamos das plantas e estendemos roupas no varal.", img: "imagenspalavras/quintal.jpg", icon: "fa-tree" }
      ],
      [
        { word: "QUIABO", syllables: "QUIA - BO", desc: "Legume verde comprido muito querido na culinária tradicional brasileira, especialmente no frango caipira.", img: "imagenspalavras/quiabo.jpg", icon: "fa-seedling" },
        { word: "QUEBRA-CABEÇA", syllables: "QUE - BRA - CA - BE - ÇA", desc: "Jogo de paciência com peças que se encaixam perfeitamente para formar uma linda imagem completa.", img: "imagenspalavras/quebracabeca.jpg", icon: "fa-puzzle-piece" },
        { word: "QUADRA", syllables: "QUA - DRA", desc: "Espaço plano demarcado no chão onde jovens e adultos praticam esportes em equipe com alegria.", img: "imagenspalavras/quadra.jpg", icon: "fa-basketball" },
        { word: "QUINDIM", syllables: "QUIN - DIM", desc: "Doce dourado e reluzente feito com gemas de ovos, coco ralado e açúcar, macio e tradicional nas confeitarias.", img: "capaletras/Cartão do Q de Queijo.png", icon: "fa-cake-candles" }
      ]
    ]
  },
  R: {
    soundText: "Letra R. Veja as palavras que começam com a letra R.",
    lots: [
      [
        { word: "RÁDIO", syllables: "RÁ - DIO", desc: "Aparelho acolhedor que sintoniza músicas antigas, orações, notícias e a voz amiga dos locutores.", img: "imagenspalavras/radio.jpg", icon: "fa-radio" },
        { word: "RELÓGIO", syllables: "RE - LÓ - GIO", desc: "Aparelho na parede ou no pulso que mostra as horas para nos organizarmos e não perdermos compromissos.", img: "imagenspalavras/relogio.jpg", icon: "fa-clock" },
        { word: "ROUPA", syllables: "ROU - PA", desc: "Peça de tecido limpa e cheirosa, como camisa ou vestido, que vestimos para nos sentirmos bem arrumados.", img: "imagenspalavras/roupa.jpg", icon: "fa-shirt" },
        { word: "RODA", syllables: "RO - DA", desc: "Peça circular de borracha e ferro que gira para movimentar automóveis, bicicletas e ônibus com suavidade.", img: "imagenspalavras/roda.jfif", icon: "fa-circle-notch" }
      ],
      [
        { word: "REDE", syllables: "RE - DE", desc: "Tecido resistente com punhos onde deitamos para balançar, relaxar o corpo e tirar uma soneca gostosa.", img: "imagenspalavras/rede.jpg", icon: "fa-bed" },
        { word: "RÉGUA", syllables: "RÉ - GUA", desc: "Instrumento reto com marcações de centímetros usado para medir tamanhos e traçar linhas retinhas no caderno.", img: "imagenspalavras/regua.jpg", icon: "fa-ruler" },
        { word: "REMÉDIO", syllables: "RE - MÉ - DIO", desc: "Medicamento receitado pelo médico para aliviar dores, curar indisposições e cuidar da saúde com carinho.", img: "imagenspalavras/remedio.jpg", icon: "fa-pills" },
        { word: "RUA", syllables: "RU - A", desc: "Caminho público calçado onde vizinhos se cumprimentam, passeiam e os carros passam com segurança.", img: "imagenspalavras/rua.jpg", icon: "fa-road" }
      ]
    ]
  },
  S: {
    soundText: "Letra S. Veja as palavras que começam com a letra S.",
    lots: [
      [
        { word: "SAPATO", syllables: "SA - PA - TO", desc: "Calçado confortável de couro ou tecido que protege nossos pés ao caminhar pelas calçadas e passear.", img: "imagenspalavras/sapato.jpg", icon: "fa-shoe-prints" },
        { word: "SABÃO", syllables: "SA - BÃO", desc: "Produto de limpeza que faz espuma com água, essencial para lavar as mãos, tomar banho e deixar a roupa limpa.", img: "imagenspalavras/sabao.jpg", icon: "fa-soap" },
        { word: "SOFÁ", syllables: "SO - FÁ", desc: "Móvel estofado e macio da sala de estar onde sentamos com conforto para conversar e ver televisão.", img: "imagenspalavras/sofa.jpg", icon: "fa-couch" },
        { word: "SINO", syllables: "SI - NO", desc: "Instrumento de bronze no alto das torres que ressoa com toque melodioso para anunciar horas e celebrações.", img: "imagenspalavras/sino.jpg", icon: "fa-bell" }
      ],
      [
        { word: "SACOLA", syllables: "SA - CO - LA", desc: "Bolsa prática com alças que levamos à feira e ao mercado para trazer compras com segurança.", img: "imagenspalavras/sacola.jpg", icon: "fa-bag-shopping" },
        { word: "SUCO", syllables: "SU - CO", desc: "Bebida refrescante feita espremendo frutas fresquinhas, cheia de nutrientes para hidratar o corpo.", img: "imagenspalavras/suco.jpg", icon: "fa-glass-water" },
        { word: "SOL", syllables: "SOL", desc: "Grande astro dourado que ilumina nossa terra, aquece as manhãs e dá vida e força a toda a natureza.", img: "imagenspalavras/sol.jpg", icon: "fa-sun" },
        { word: "SOPA", syllables: "SO - PA", desc: "Caldo quentinho e reconfortante feito com legumes fatiados e carne, ideal para alimentar a família no jantar.", img: "imagenspalavras/sopa.jpg", icon: "fa-bowl-food" }
      ]
    ]
  },
  T: {
    soundText: "Letra T. Veja as palavras que começam com a letra T.",
    lots: [
      [
        { word: "TELEFONE", syllables: "TE - LE - FO - NE", desc: "Aparelho que usamos para ligar para os filhos, netos e amigos, matando a saudade com uma boa conversa.", img: "imagenspalavras/telefone.jpg", icon: "fa-phone" },
        { word: "TESOURA", syllables: "TE - SOU - RA", desc: "Ferramenta com duas lâminas móveis usada para aparar tecidos, cortar papéis e abrir embalagens com facilidade.", img: "imagenspalavras/tesoura.jpg", icon: "fa-scissors" },
        { word: "TOALHA", syllables: "TO - A - LHA", desc: "Pano felpudo e absorvente que usamos para nos enxugar com suavidade após um banho relaxante.", img: "imagenspalavras/toalha.png", icon: "fa-rug" },
        { word: "TOMATE", syllables: "TO - MA - TE", desc: "Fruto vermelho e suculento da horta, base saborosa para molhos caseiros e saladas frescas com azeite.", img: "capaletras/Cartaz Infantil da Letra T com Tomate.png", icon: "fa-apple-whole" }
      ],
      [
        { word: "TIGELA", syllables: "TI - GE - LA", desc: "Vasilha arredondada de louça ou inox usada para bater massas de bolo, tomar caldos e servir alimentos.", img: "imagenspalavras/tigela.jpg", icon: "fa-bowl-food" },
        { word: "TAPETE", syllables: "TA - PE - TE", desc: "Peça de tecido aconchegante que forra o chão da sala ou do quarto, trazendo beleza e calor aos pés.", img: "imagenspalavras/tapete.jpg", icon: "fa-rug" },
        { word: "TINTA", syllables: "TIN - TA", desc: "Líquido colorido usado para renovar a pintura das paredes de casa ou criar lindas obras de artesanato.", img: "imagenspalavras/tinta.jpg", icon: "fa-paint-roller" },
        { word: "TREM", syllables: "TREM", desc: "Meio de transporte comprido com vários vagões que anda sobre trilhos de ferro cortando as cidades e campos.", img: "imagenspalavras/trem.jpg", icon: "fa-train" }
      ]
    ]
  },
  U: {
    soundText: "Letra U. Veja as palavras que começam com a letra U.",
    lots: [
      [
        { word: "UVA", syllables: "U - VA", desc: "Frutinha redonda e doce que nasce em cachos caprichados, maravilhosa para comer pura ou em sucos naturais.", img: "capaletras/Cartaz Educativo da Uva.png", icon: "fa-wine-glass" },
        { word: "URSO", syllables: "UR - SO", desc: "Animal grande e peludo que habita as florestas, muito representado em brinquedos de pelúcia fofinhos.", img: "imagenspalavras/urso.jpg", icon: "fa-paw" },
        { word: "UNHA", syllables: "U - NHA", desc: "Lâmina firme que protege a ponta dos nossos dedos, que cortamos e lixamos com capricho para mantê-las limpas.", img: "imagenspalavras/unha.png", icon: "fa-hand" },
        { word: "UNIFORME", syllables: "U - NI - FOR - ME", desc: "Conjunto de roupas padronizadas usado com orgulho por estudantes na escola e profissionais no trabalho.", img: "imagenspalavras/uniforme.png", icon: "fa-shirt" }
      ],
      [
        { word: "URNA", syllables: "UR - NA", desc: "Aparelho seguro onde o cidadão deposita seu voto com consciência nas eleições para escolher seus representantes.", img: "imagenspalavras/urna.jpg", icon: "fa-box-archive" },
        { word: "UNIVERSO", syllables: "U - NI - VER - SO", desc: "A imensidão do espaço que abriga todas as galáxias, planetas, o sol, a lua e a nossa linda Terra.", img: "imagenspalavras/universo.jpg", icon: "fa-globe" },
        { word: "URUBU", syllables: "U - RU - BU", desc: "Ave de penas escuras muito importante para a natureza, pois ajuda a manter o meio ambiente limpo e equilibrado.", img: "imagenspalavras/urubu.jpg", icon: "fa-feather" },
        { word: "UMBIGO", syllables: "UM - BI - GO", desc: "Pequena marquinha no meio da barriga que nos ligava com amor à nossa mãe antes de nascermos.", img: "imagenspalavras/umbigo.png", icon: "fa-circle-dot" }
      ]
    ]
  },
  V: {
    soundText: "Letra V. Veja as palavras que começam com a letra V.",
    lots: [
      [
        { word: "VASO", syllables: "VA - SO", desc: "Peça de barro ou cerâmica onde plantamos flores cheirosas e folhagens para enfeitar a casa com vida.", img: "imagenspalavras/vaso.jpg", icon: "fa-seedling" },
        { word: "VELA", syllables: "VE - LA", desc: "Cilindro de cera com pavio que acendemos para iluminar momentos de oração ou quando falta luz à noite.", img: "imagenspalavras/vela.jpg", icon: "fa-fire" },
        { word: "VASSOURA", syllables: "VAS - SOU - RA", desc: "Cabo com cerdas usado para varrer a sujeira do chão e deixar os cômodos de casa impecáveis e limpos.", img: "imagenspalavras/vassoura.png", icon: "fa-broom" },
        { word: "VIDRO", syllables: "VI - DRO", desc: "Material liso e transparente usado em janelas, portas e copos que nos deixa ver através dele.", img: "imagenspalavras/vidro.jpg", icon: "fa-square" }
      ],
      [
        { word: "VACA", syllables: "VA - CA", desc: "Animal dócil e generoso da fazenda que pasta calmamente no capim e nos presenteia com leite nutritivo todo dia.", img: "capaletras/Cartaz educativo da letra V com vaca.png", icon: "fa-cow" },
        { word: "VENTILADOR", syllables: "VEN - TI - LA - DOR", desc: "Aparelho elétrico com hélices giratórias que cria um vento fresco para aliviar as tardes de calor intenso.", img: "imagenspalavras/ventilador.png", icon: "fa-fan" },
        { word: "VESTIDO", syllables: "VES - TI - DO", desc: "Roupa feminina inteira, elegante e confortável, perfeita para passeios em dias bonitos e festas em família.", img: "imagenspalavras/vestido.png", icon: "fa-person-dress" },
        { word: "VIOLÃO", syllables: "VIO - LÃO", desc: "Instrumento musical de madeira com cordas de náilon que dedilhamos para cantar modas e canções queridas.", img: "imagenspalavras/violao.jpg", icon: "fa-guitar" }
      ]
    ]
  },
  W: {
    soundText: "Letra W. Veja as palavras que começam com a letra W.",
    lots: [
      [
        { word: "WHATSAPP", syllables: "WHAT - SAPP", desc: "Aplicativo de celular muito útil que usamos para mandar mensagens, fotos e áudios com a voz da família.", img: "capaletras/Cartão Educativo da Letra W com WhatsApp.png", icon: "fa-brands fa-whatsapp" },
        { word: "WI-FI", syllables: "WI - FI", desc: "Internet sem fio que conecta celulares e computadores em casa para nos comunicarmos com quem amamos.", img: "imagenspalavras/wifi.jpg", icon: "fa-wifi" },
        { word: "WEB", syllables: "WEB", desc: "A grande rede mundial de computadores que liga o mundo inteiro e nos permite aprender novidades.", img: "imagenspalavras/web.jpg", icon: "fa-globe" },
        { word: "WALKMAN", syllables: "WALK - MAN", desc: "Aparelho clássico de bolso com fones de ouvido usado antigamente para ouvir fitas de música ao caminhar.", img: "imagenspalavras/walkman.png", icon: "fa-headphones" }
      ],
      [
        { word: "WAFFLE", syllables: "WAF - FLE", desc: "Massa fofinha em formato quadriculado, servida quentinha com mel, geleia ou manteiga no café da manhã.", img: "imagenspalavras/waffle.jpg", icon: "fa-stroopwafel" },
        { word: "WEBCAM", syllables: "WEB - CAM", desc: "Câmera conectada à tela que transmite nossa imagem ao vivo durante chamadas de vídeo com parentes distantes.", img: "imagenspalavras/webcam.jpg", icon: "fa-video" },
        { word: "WIND SURF", syllables: "WIND - SURF", desc: "Esporte aquático praticado sobre uma prancha com vela que desliza sobre as ondas pela força do vento.", img: "imagenspalavras/windsurf.jpg", icon: "fa-water" },
        { word: "WORKSHOP", syllables: "WORK - SHOP", desc: "Encontro dinâmico onde pessoas se reúnem em uma sala para praticar e aprender uma nova atividade útil.", img: "imagenspalavras/workshop.jpg", icon: "fa-chalkboard-user" }
      ]
    ]
  },
  X: {
    soundText: "Letra X. Veja as palavras que começam com a letra X.",
    lots: [
      [
        { word: "XÍCARA", syllables: "XÍ - CA - RA", desc: "Pequena louça com asa lateral que seguramos com a mão para tomar café coado quentinho ou chá digestivo.", img: "imagenspalavras/xicara.png", icon: "fa-mug-hot" },
        { word: "XALE", syllables: "XA - LE", desc: "Manta macia de lã colocada sobre as costas e ombros para nos manter aquecidos e protegidos do frio.", img: "imagenscartilha/x.png", icon: "fa-rug" },
        { word: "XAROPE", syllables: "XA - RO - PE", desc: "Remédio docinho e espesso tomado com colher para acalmar a tosse e suavizar a garganta irritada.", img: "imagenspalavras/xarope.jpg", icon: "fa-bottle-droplet" },
        { word: "XADREZ", syllables: "XA - DREZ", desc: "Jogo tradicional de estratégia praticado com reis, rainhas e cavalos sobre um tabuleiro quadriculado.", img: "imagenscartilha/x.png", icon: "fa-chess" }
      ],
      [
        { word: "XERIFE", syllables: "XE - RI - FE", desc: "Homem da lei de antigamente que usava estrela no peito para garantir a ordem e o respeito nas cidades.", img: "imagenscartilha/x.png", icon: "fa-star" },
        { word: "XAMPU", syllables: "XAM - PU", desc: "Sabonete líquido perfumado que produz espuma cremosa para lavar o cabelo e o couro cabeludo no banho.", img: "imagenspalavras/xampu.png", icon: "fa-pump-soap" },
        { word: "XILOFONE", syllables: "XI - LO - FO - NE", desc: "Instrumento musical com plaquinhas coloridas que tocamos com baquetas para tirar notas suaves e alegres.", img: "imagenscartilha/x.png", icon: "fa-music" },
        { word: "XODÓ", syllables: "XO - DÓ", desc: "Palavra cheia de afeto usada para expressar carinho por um neto, um bicho de estimação ou algo muito querido.", img: "imagenscartilha/x.png", icon: "fa-heart" }
      ]
    ]
  },
  Y: {
    soundText: "Letra Y. Veja as palavras que começam com a letra Y.",
    lots: [
      [
        { word: "YOGA", syllables: "YO - GA", desc: "Prática saudável de alongamentos suaves e respiração calma que relaxa os músculos e traz serenidade à mente.", img: "imagenspalavras/yoga.jpg", icon: "fa-spa" },
        { word: "YAKISOBA", syllables: "YA - KI - SO - BA", desc: "Prato oriental saboroso feito com macarrão frito, legumes coloridos e carne macia com molho de soja.", img: "imagenspalavras/yakisoba.jpg", icon: "fa-bowl-food" },
        { word: "YAKULT", syllables: "YA - KULT", desc: "Bebida láctea em potinho com probióticos saudáveis que protegem o intestino e fortalecem o organismo.", img: "imagenscartilha/y.png", icon: "fa-bottle-water" },
        { word: "YOUTUBE", syllables: "YOU - TUBE", desc: "Site na internet onde podemos ver vídeos de culinária, canções antigas inesquecíveis e orações a qualquer hora.", img: "imagenscartilha/y.png", icon: "fa-brands fa-youtube" }
      ],
      [
        { word: "YORKSHIRE", syllables: "YORK - SHI - RE", desc: "Raça de cachorrinho pequeno e afetuoso, com pelos longos e olhos vivos, ótimo companheiro de colo.", img: "imagenscartilha/y.png", icon: "fa-dog" },
        { word: "YEN", syllables: "YEN", desc: "Moeda oficial do Japão usada para pagar compras e serviços naquele país do outro lado do mundo.", img: "imagenscartilha/y.png", icon: "fa-coins" },
        { word: "YOGURT", syllables: "YO - GURT", desc: "Forma de escrever iogurte em embalagens internacionais, alimento cremoso feito à base de leite fresco.", img: "imagenscartilha/y.png", icon: "fa-bowl-rice" },
        { word: "KARAOKÊ", syllables: "KA - RA - O - KÊ", desc: "Aparelho divertido onde cantamos músicas conhecidas acompanhando a letra na tela da TV com alegria.", img: "imagenspalavras/karaoke.png", icon: "fa-microphone" }
      ]
    ]
  },
  Z: {
    soundText: "Letra Z. Veja as palavras que começam com a letra Z.",
    lots: [
      [
        { word: "ZEBRA", syllables: "ZE - BRA", desc: "Animal veloz da família dos cavalos que vive na África, famoso pelo seu belo pelo listrado de preto e branco.", img: "capaletras/Cartaz Educativo da Zebra e da Letra Z.png", icon: "fa-paw" },
        { word: "ZÍPER", syllables: "ZÍ - PER", desc: "Fecho prático de metal ou plástico que usamos para fechar jaquetas, calças e bolsas com rapidez.", img: "imagenspalavras/ziper.jpg", icon: "fa-bars" },
        { word: "ZERO", syllables: "ZE - RO", desc: "Número inicial que marca o ponto de partida de uma contagem e a ausência de quantidade na matemática.", img: "imagenspalavras/zero.png", icon: "fa-0" },
        { word: "ZOOLÓGICO", syllables: "ZOO - LÓ - GI - CO", desc: "Parque arborizado e protegido onde vivem e recebem cuidados veterinários animais de várias partes do mundo.", img: "imagenspalavras/zoologico.jpg", icon: "fa-tree" }
      ],
      [
        { word: "ZEPELIM", syllables: "ZE - PE - LIM", desc: "Grande aeronave prateada em forma de charuto que flutuava suavemente pelo céu no início da aviação.", img: "imagenspalavras/zeppelin.jpg", icon: "fa-plane" },
        { word: "ZANGÃO", syllables: "ZAN - GÃO", desc: "Abelha macho da colmeia, importante para a reprodução e para a harmonia da vida das abelhinhas que fazem mel.", img: "imagenspalavras/zangao.jpg", icon: "fa-bug" },
        { word: "ZINCO", syllables: "ZIN - CO", desc: "Metal e mineral essencial para a resistência do corpo e muito utilizado na fabricação de telhas firmes.", img: "imagenspalavras/zinco.jpg", icon: "fa-cubes" },
        { word: "ZABUMBA", syllables: "ZA - BUM - BA", desc: "Grande tambor de couro que toca o ritmo animado do baião e do forró pé-de-serra nordestino.", img: "imagenscartilha/z.png", icon: "fa-drum" }
      ]
    ]
  }
};

// Check image paths
let total = 0, found = 0, missing = [];
for (const l in wordDictionary) {
  for (const lot of wordDictionary[l].lots) {
    for (const item of lot) {
      total++;
      if (fs.existsSync(item.img)) {
        found++;
      } else {
        missing.push(item.img);
      }
    }
  }
}

console.log(`Total items: ${total}, Existing images: ${found}, Missing: ${missing.length}`);
if (missing.length > 0) {
  console.log('Missing files:', missing);
}

fs.writeFileSync('scratch/catalog_dict.json', JSON.stringify(wordDictionary, null, 2));
console.log('Saved catalog_dict.json successfully!');
