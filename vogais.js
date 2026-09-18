/**
 * ============================================================================
 * AprendIDos - Atividade Interativa: Conhecendo as Vogais
 * Arquivo: vogais.js
 * 
 * Sistema de Áudio Duplo (Google TTS + Web Speech API Nativo)
 * Desenvolvido com carinho para idosos e adultos em processo de alfabetização.
 * Voz calma, lenta e clara em Português do Brasil.
 * ============================================================================
 */

// ============================================================================
// DADOS DAS VOGAIS — Letras e Exemplos Principais
// ============================================================================
var vowelData = {
    a: { letter: 'A', example: 'Avião' },
    e: { letter: 'E', example: 'Escada' },
    i: { letter: 'I', example: 'Ilha' },
    o: { letter: 'O', example: 'Ônibus' },
    u: { letter: 'U', example: 'Urso' }
};

// ============================================================================
// SIGNIFICADOS AMIGÁVEIS DAS PALAVRAS — ADAPTADOS PARA O PÚBLICO IDOSO
// Linguagem acolhedora, valorizando vivências, memórias e afeto (200 palavras)
// ============================================================================
var wordMeanings = {
    // ── VOGAL A (40 palavras) ──
    'Abelha': 'Pequeno inseto que voa de flor em flor e produz o mel docinho.',
    'Árvore': 'Planta grande com tronco forte e folhas, que nos dá sombra fresca e frutos.',
    'Amigo': 'Pessoa querida e de confiança com quem gostamos de conversar e conviver.',
    'Amor': 'Sentimento bonito de carinho, afeto e cuidado por alguém especial.',
    'Avó': 'A mãe da nossa mãe ou do nosso pai, cheia de carinho e histórias.',
    'Avô': 'O pai da nossa mãe ou do nosso pai, companheiro querido da família.',
    'Água': 'Líquido puro e transparente essencial para beber, cozinhar e ter saúde.',
    'Alface': 'Verdura de folhas verdes e fresquinhas, muito usada em saladas saudáveis.',
    'Azul': 'A cor do céu limpo em um dia ensolarado e das águas do mar.',
    'Abóbora': 'Legume saboroso de cor alaranjada, ótimo para fazer sopas e doces caseiros.',
    'Abraço': 'Gesto carinhoso de envolver outra pessoa com os braços para demonstrar afeto.',
    'Açúcar': 'Ingrediente branquinho e doce usado para adoçar café, chás e sobremesas.',
    'Alegria': 'Sentimento muito bom de felicidade, contentamento e vontade de sorrir.',
    'Aluno': 'Pessoa que se dedica a aprender coisas novas na escola ou na vida.',
    'Anel': 'Enfeite em formato de aro que usamos nos dedos da mão.',
    'Arco': 'Objeto em formato de curva, como o arco-íris colorido que vemos no céu.',
    'Avião': 'Grande transporte com asas que voa bem alto pelo céu levando pessoas.',
    'Avental': 'Peça de tecido usada na frente da roupa para não se sujar ao cozinhar ou trabalhar.',
    'Aranha': 'Pequeno animal de oito perninhas que tece teias delicadas para viver.',
    'Amora': 'Frutinha pequena, redonda e escura, bem docinha para comer no pé.',
    'Almofada': 'Espécie de travesseiro macio usado no sofá ou na cama para dar conforto.',
    'Anzol': 'Pequeno ganchinho de metal preso na linha de pesca para pescar peixes.',
    'Apito': 'Pequeno objeto que faz um som agudo e forte quando sopramos nele.',
    'Arame': 'Fio fino de metal flexível, usado para prender coisas ou fazer cercas.',
    'Areia': 'Pequenos grãozinhos macios que encontramos nas praias e beiras de rios.',
    'Armário': 'Móvel com portas e prateleiras para guardar roupas, louças e mantimentos.',
    'Aula': 'Momento de estudo onde aprendemos novos conhecimentos com o professor.',
    'Aveia': 'Cereal saudável em flocos, muito gostoso em mingaus e com frutas.',
    'Azulejo': 'Placa decorativa de cerâmica usada para revestir paredes de cozinhas e banheiros.',
    'Agulha': 'Pequeno instrumento fininho de metal usado para costurar tecidos e botões.',
    'Alho': 'Tempero de sabor marcante que usamos para refogar o arroz e o feijão.',
    'Aliança': 'Anel de ouro ou prata usado para simbolizar o casamento e a união.',
    'Azeite': 'Óleo saudável feito de azeitonas, muito usado para temperar a comida.',
    'Abacaxi': 'Fruta tropical com casca áspera, coroa verde e polpa amarela e doce.',
    'Abacate': 'Fruta verde e cremosa, ótima para fazer vitaminas e comer amassadinha.',
    'Arroz': 'Grão branquinho essencial no prato do brasileiro, que acompanha o feijão.',
    'Asa': 'Parte do corpo das aves e passarinhos que serve para eles voarem.',
    'Agasalho': 'Roupa quentinha usada para nos proteger do frio e do vento.',
    'Alma': 'A nossa essência interior, sentimentos e vida que carregamos no coração.',
    'Amarelo': 'A cor brilhante do sol da manhã, do girassol e da gema de ovo.',

    // ── VOGAL E (40 palavras) ──
    'Escola': 'Lugar acolhedor onde as pessoas vão para aprender, ler, escrever e fazer amigos.',
    'Elefante': 'Animal muito grande com orelhas largas e uma tromba longa e forte.',
    'Estrela': 'Ponto brilhante de luz que ilumina o céu durante as noites escuras.',
    'Escada': 'Estrutura com degraus para subir ou descer de um andar para o outro.',
    'Espelho': 'Objeto de vidro liso que reflete com clareza a nossa imagem.',
    'Erva': 'Planta verde que usamos na cozinha para temperar ou fazer chás aromáticos.',
    'Ervilha': 'Pequeno grãozinho verde e macio, muito saboroso em sopas e saladas.',
    'Estrada': 'Caminho largo por onde passam os carros, ônibus e caminhões em viagens.',
    'Enfermeiro': 'Profissional da saúde que cuida dos pacientes com carinho e atenção.',
    'Escova': 'Objeto com cerdas usado para pentear o cabelo ou escovar os dentes.',
    'Envelope': 'Capa de papel usada para guardar e enviar cartas, cartões e documentos.',
    'Espiga': 'Parte do pé de milho coberta por grãos amarelos saborosos.',
    'Espada': 'Antiga arma comprida com lâmina de metal e cabo para segurar.',
    'Estante': 'Móvel com prateleiras abertas para organizar livros, fotos e enfeites.',
    'Esponja': 'Material macio e poroso que usamos para ensaboar a louça ou tomar banho.',
    'Estojo': 'Bolsinha pequena para guardar lápis, borrachas, canetas e materiais de estudo.',
    'Esquilo': 'Pequeno bichinho ágil da floresta com rabo felpudo que adora nozes.',
    'Espuma': 'Massa cheia de bolhinhas de sabão que se forma na água ao lavar algo.',
    'Esteira': 'Tapete de palha ou tecido usado para descansar ou forrar o chão.',
    'Égua': 'Fêmea do cavalo, animal forte e companheiro das pessoas no campo.',
    'Elástico': 'Tira flexível que estica bastante e depois volta ao tamanho normal.',
    'Elevador': 'Cabine segura que sobe e desce prédios para levar pessoas entre os andares.',
    'Emoção': 'Sentimento forte que mexe com a gente, como alegria, saudade ou entusiasmo.',
    'Empada': 'Salgadinho de massa crocante assada com recheio saboroso de frango ou palmito.',
    'Empadão': 'Torta grande e caprichada de forno, perfeita para o almoço de domingo.',
    'Enxada': 'Ferramenta de cabo comprido de madeira usada para capinar e cuidar da terra.',
    'Escrita': 'A arte de formar palavras e frases usando as letras do alfabeto.',
    'Estação': 'Local onde param os trens e ônibus, ou as épocas do ano como o verão.',
    'Esmalte': 'Tinta líquida e colorida usada para pintar e embelezar as unhas.',
    'Espinho': 'Pontinha pontiaguda de algumas plantas, como a roseira, que exige cuidado.',
    'Espinafre': 'Verdura de folhas verde-escuras, muito nutritiva e boa para a saúde.',
    'Enxoval': 'Conjunto de roupas de cama, mesa e banho reunidas para uma casa nova.',
    'Espeto': 'Haste de madeira ou metal usada para assar carnes e legumes na brasa.',
    'Enxame': 'Grande grupo de abelhas que voam e trabalham juntas na colmeia.',
    'Estudante': 'Aquele que dedica o seu tempo a estudar e descobrir novos saberes.',
    'Ensopado': 'Prato quente e reconfortante de carne ou legumes cozidos em caldo temperado.',
    'Espantalho': 'Boneco feito de palha e roupas velhas colocado na horta para espantar pássaros.',
    'Entrada': 'Porta ou portão por onde passamos para entrar em uma casa ou lugar.',
    'Espaço': 'Lugar amplo e aberto, ou a imensidão do céu onde ficam a lua e as estrelas.',
    'Enfeite': 'Objeto bonito usado para decorar e deixar o ambiente mais alegre.',

    // ── VOGAL I (40 palavras) ──
    'Igreja': 'Templo sagrado onde as pessoas se reúnem para orar, agradecer e celebrar a fé.',
    'Ilha': 'Porção de terra cercada de água limpa por todos os lados.',
    'Inseto': 'Pequeno ser vivo da natureza, como borboletas, joaninhas e abelhas.',
    'Idoso': 'Homem maduro que já acumulou muitos anos de vida, experiências e sabedoria.',
    'Idosa': 'Mulher experiente que carrega nos cabelos e no coração a sabedoria dos anos.',
    'Inverno': 'A estação mais fria do ano, época de usar agasalho quentinho e tomar sopa.',
    'Irmão': 'Menino ou homem que é filho dos mesmos pais que nós, nosso companheiro.',
    'Irmã': 'Menina ou mulher que é filha dos mesmos pais que nós, amiga da família.',
    'Início': 'O começo de alguma coisa boa, como o primeiro passo de uma caminhada.',
    'Índio': 'Membro dos povos originários que já viviam no Brasil em harmonia com as matas.',
    'Imagem': 'Foto, desenho ou figura que representa uma pessoa, lugar ou memória querida.',
    'Ingresso': 'Bilhete que dá direito a entrar no cinema, no teatro ou em uma festa.',
    'Incêndio': 'Fogo grande e descontrolado que os bombeiros trabalham para apagar.',
    'Ipê': 'Árvore brasileira linda que se enche de flores amarelas, roxas ou brancas.',
    'Isqueiro': 'Pequeno aparelho portátil que produz faísca ou chama para acender o fogão.',
    'Iogurte': 'Alimento cremoso e gostoso feito com leite fermentado, bom para o café.',
    'Injeção': 'Remédio líquido aplicado com agulhinha para proteger a saúde ou aliviar dor.',
    'Ímã': 'Pedacinho de metal que atrai objetos de ferro, como os que prendem recados na geladeira.',
    'Idade': 'Quantidade de anos que uma pessoa já viveu com saúde e histórias para contar.',
    'Inchaço': 'Parte do corpo que fica mais alta e aumentada após uma batida ou picada.',
    'Incenso': 'Bastão perfumado que, ao queimar bem devagar, solta fumaça de cheiro suave.',
    'Infância': 'A fase gostosa do começo da vida em que éramos crianças e brincávamos.',
    'Instrumento': 'Objeto usado para tocar música, como o violão, ou ferramenta de trabalho.',
    'Iguana': 'Lagarto verde e tranquilo que gosta de ficar quieto no sol tomando calor.',
    'Igual': 'Coisa que é idêntica ou equivalente a outra, sem nenhuma diferença.',
    'Irmandade': 'União fraterna e carinhosa entre amigos ou companheiros de vida.',
    'Ideia': 'Pensamento novo que surge na cabeça para resolver algo ou criar algo bom.',
    'Irrigar': 'Ação de molhar as plantinhas e a terra da horta para que cresçam fortes.',
    'Iluminação': 'Conjunto de lâmpadas que clareiam as ruas e os cômodos da nossa casa.',
    'Ilustração': 'Desenho ou pintura bonita feita em um livro para acompanhar a leitura.',
    'Intervalo': 'Momento de descanso entre as tarefas para relaxar e tomar um café.',
    'Incrível': 'Algo surpreendente, maravilhoso e muito especial que chama nossa atenção.',
    'Inchar': 'Aumentar de volume por acúmulo de líquido, como os pés depois de muito caminhar.',
    'Iniciar': 'Dar o primeiro passo para começar uma nova atividade com ânimo.',
    'Inocente': 'Pessoa que não tem culpa de nada errado e tem o coração puro e sincero.',
    'Impressora': 'Máquina que passa textos e fotos do computador para a folha de papel.',
    'Inseticida': 'Produto próprio para afastar mosquitos e insetos indesejados da casa.',
    'Invasão': 'Ato de entrar em algum lugar onde não foi convidado ou permitido.',
    'Inveja': 'Sentimento negativo de querer o que é do outro; o melhor é sempre desejar o bem.',
    'Imposto': 'Contribuição financeira que a população paga para ajudar nos serviços públicos.',

    // ── VOGAL O (40 palavras) ──
    'Ovelha': 'Animal manso de fazenda coberto por uma lã macia usada para fazer agasalhos.',
    'Ouro': 'Metal precioso e brilhante de cor amarela, muito valioso para fazer joias.',
    'Olho': 'Órgão precioso do corpo que nos permite enxergar o mundo e quem amamos.',
    'Ônibus': 'Grande veículo de transporte coletivo que leva as pessoas pela cidade.',
    'Ovo': 'Alimento saboroso e nutritivo de casca lisa, produzido pelas galinhas.',
    'Oração': 'Momento de conversar com Deus, agradecer pelas bênçãos e pedir proteção.',
    'Obra': 'Construção de uma casa ou edifício, ou uma pintura criada por um artista.',
    'Osso': 'Parte dura e resistente que forma o esqueleto e sustenta o nosso corpo.',
    'Orelha': 'Parte externa do ouvido por onde escutamos as músicas e conversas queridas.',
    'Ombro': 'Parte do corpo que liga o pescoço ao braço, onde costumamos dar apoio.',
    'Onça': 'Lindo felino pintado das florestas brasileiras, forte e muito ágil.',
    'Orvalho': 'Gotículas frescas de água que cobrem as folhas das plantas no amanhecer.',
    'Ouriço': 'Pequeno bichinho da natureza com o corpo protegido por espinhos curtos.',
    'Outono': 'Estação do ano em que as folhas caem das árvores e o clima fica ameno.',
    'Outubro': 'O décimo mês do ano, conhecido pela primavera florida e dia das crianças.',
    'Oferta': 'Preço especial com desconto em uma loja, ou algo generoso oferecido de coração.',
    'Ostra': 'Molusco do fundo do mar que vive em concha dupla e às vezes guarda pérolas.',
    'Óculos': 'Aparelho com lentes limpas colocado no rosto para ajudar a enxergar bem melhor.',
    'Óleo': 'Líquido suave e escorregadio usado na cozinha para cozinhar ou lubrificar peças.',
    'Onda': 'Movimento das águas do mar que sobem, descem e quebram suavemente na areia.',
    'Orquídea': 'Flor muito bonita, nobre e colorida que nasce em troncos de árvores.',
    'Oca': 'Casa tradicional e comunitária construída pelos povos indígenas com palha.',
    'Oficina': 'Lugar onde ferramentas e profissionais consertam carros, sapatos ou objetos.',
    'Orelhão': 'Aparelho telefônico público de rua, protegido por uma concha grande.',
    'Ontem': 'O dia que já passou, que vivemos antes de hoje.',
    'Orquestra': 'Grande grupo de músicos talentosos tocando vários instrumentos juntos.',
    'Orgulho': 'Sentimento bom de satisfação ao ver uma conquista honesta de quem amamos.',
    'Orla': 'Calçadão agradável que fica à beira da praia, ótimo para caminhadas ao entardecer.',
    'Ordem': 'Organização das coisas em seus devidos lugares, sem bagunça.',
    'Origem': 'O lugar, cidade ou família de onde viemos; o ponto de partida de tudo.',
    'Orégano': 'Erva de cheiro muito gostoso que colocamos na pizza e no molho de tomate.',
    'Oito': 'O número que vem logo depois do sete e antes do nove.',
    'Oitavo': 'Aquele que ocupa a posição de número oito em uma fila ou lista.',
    'Ocupado': 'Lugar ou pessoa que está cheia de afazeres e sem tempo vago no momento.',
    'Operário': 'Trabalhador dedicado que põe as mãos na massa em fábricas ou construções.',
    'Oceano': 'Enorme extensão de água salgada que cobre a maior parte do nosso planeta.',
    'Objeto': 'Qualquer coisa material que podemos ver e tocar, como um copo ou uma caneta.',
    'Ovelhinha': 'Filhote meigo e peludinho da ovelha, muito fofo e dócil.',
    'Olhada': 'Olhar rápido e atento dado a alguma coisa que chama a nossa atenção.',
    'Oásis': 'Lugar bonito e fértil com água fresca e sombra no meio de um deserto seco.',

    // ── VOGAL U (40 palavras) ──
    'Uva': 'Fruta gostosa que dá em cachos, muito doce para comer pura ou em sucos e vinhos.',
    'Urubu': 'Grande ave de penas pretas da natureza que ajuda na limpeza do meio ambiente.',
    'Urso': 'Animal grande e forte com pelos grossos que vive nas matas e montanhas.',
    'Unha': 'Lâmina dura e protetora que cresce na ponta dos nossos dedos.',
    'Uniforme': 'Roupa igual usada por estudantes, trabalhadores ou times para identificação.',
    'Universo': 'Tudo o que existe no espaço: estrelas, planetas, sol, lua e galáxias.',
    'Urgência': 'Situação importante que precisa de atenção rápida e cuidado imediato.',
    'Último': 'Aquele que vem no final de tudo, depois de todos os outros.',
    'Usina': 'Grande instalação industrial onde se produz eletricidade ou açúcar.',
    'Útil': 'Coisa ou pessoa que ajuda, serve para algo de bom e facilita nossa vida.',
    'Urna': 'Caixa segura onde os cidadãos depositam seus votos nas eleições.',
    'Úmido': 'Algo que está levemente molhado, como a terra boa após uma chuvinha fina.',
    'Umbigo': 'Pequena marquinha redonda no centro da barriga por onde fomos nutridos na mãe.',
    'Umidade': 'Presença de vapor de água no ar ou frescor na terra.',
    'Unidade': 'Coisa única e inteira, ou posto de saúde do bairro que atende a vizinhança.',
    'União': 'Pessoas que se juntam com amor e respeito para ajudar e viver em harmonia.',
    'Único': 'Algo especial que não tem outro igual no mundo todo.',
    'Ursinho': 'Bichinho fofo de pelúcia que as crianças abraçam com carinho para dormir.',
    'Urucum': 'Fruto com sementinhas vermelhas usado para fazer o colorau caseiro de cozinhar.',
    'Uivar': 'O som longo e afinado que os lobos e cachorros soltam olhando para a lua.',
    'Umbu': 'Fruta típica e saborosa do sertão nordestino, suculenta e refrescante.',
    'Urtiga': 'Planta do mato que pinica e causa coceira se tocada na pele.',
    'Urgente': 'Assunto importante que não pode ser deixado para depois.',
    'Uso': 'Ato de usar ou utilizar algum objeto no dia a dia.',
    'Usar': 'Aproveitar uma ferramenta, roupa ou utensílio para alguma finalidade.',
    'Usado': 'Objeto que já teve utilidade por alguém, mas ainda serve e tem história.',
    'Urina': 'Líquido eliminado pelo corpo ao fazermos xixi, filtrado pelos rins.',
    'Ungento': 'Pomadinha medicinal suave usada para passar na pele e aliviar dores.',
    'Uruguai': 'País vizinho ao sul do Brasil, conhecido por suas planícies e gente acolhedora.',
    'Unicórnio': 'Criatura das histórias infantis: cavalo branco com um chifre mágico na testa.',
    'Urbano': 'Tudo aquilo que diz respeito à cidade e aos seus bairros e ruas.',
    'Ultra': 'Palavra que indica algo muito grande, além do comum ou muito moderno.',
    'Uvaia': 'Fruta nativa brasileira amarela, aromática e com sabor levemente azedinho.',
    'Unificado': 'Coisas que foram reunidas em um só grupo ou conjunto organizado.',
    'Uivando': 'Ação de soltar um uivo longo no silêncio da noite.',
    'Utensílio': 'Ferramenta ou objeto útil da casa, como colher, garfo e panelas na cozinha.',
    'Upa': 'Unidade de Pronto Atendimento que cuida de emergências de saúde no bairro.',
    'Umbro': 'Marca tradicional e conhecida de artigos esportivos e calçados.',
    'Urgindo': 'Algo que está pedindo rapidez e pressa para ser feito.',
    'Umedecer': 'Molhar suavemente com um pouquinho de água, sem ensopar.'
};

// ============================================================================
// BANCO DE PALAVRAS — 200 palavras do cotidiano brasileiro (40 por vogal)
// ============================================================================
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
var ptVoiceCache = null;

// Pré-carrega vozes do navegador
function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    var voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        ptVoiceCache = voices.find(function(v) {
            return v.lang === 'pt-BR' || v.lang === 'pt_BR' || v.lang.startsWith('pt');
        }) || null;
    }
}

if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Sistema de Áudio Duplo Infalível (Google TTS Online + Web Speech API Local)
 */
function speak(text, onEnd) {
    // Interrompe qualquer áudio prévio
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

    document.querySelectorAll('.speaking').forEach(function(el) {
        el.classList.remove('speaking');
    });

    var googleTtsUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=tw-ob&q=' + encodeURIComponent(text);
    var audio = new Audio(googleTtsUrl);
    currentAudio = audio;

    var audioPlayedSuccess = false;

    audio.onended = function() {
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
    };

    audio.onerror = function() {
        if (!audioPlayedSuccess) {
            speakNativo(text, onEnd);
        }
    };

    var playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(function() {
            audioPlayedSuccess = true;
        }).catch(function(err) {
            speakNativo(text, onEnd);
        });
    }
}

/**
 * Síntese Nativa do Navegador (Fallback Robusto)
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
    u.rate = 0.85; // Velocidade calma e confortável para idosos
    u.pitch = 1.0;
    u.volume = 1.0;

    if (!ptVoiceCache) loadVoices();
    if (ptVoiceCache) u.voice = ptVoiceCache;

    var cleanup = function() {
        document.querySelectorAll('.speaking').forEach(function(el) { el.classList.remove('speaking'); });
        if (onEnd) onEnd();
    };

    u.onend = cleanup;
    u.onerror = cleanup;

    setTimeout(function() {
        try {
            window.speechSynthesis.speak(u);
        } catch (e) {
            cleanup();
        }
    }, 80);
}

// Destaca visualmente a primeira vogal da palavra
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

// ============================================================================
// CICLO DE EXERCÍCIOS
// ============================================================================
function initExercise() {
    questions = shuffle(wordBank.slice()).slice(0, TOTAL);
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
    if (cardEl) cardEl.style.display = 'flex';
    if (compEl) compEl.classList.remove('visible');

    loadQuestion();
}

function loadQuestion() {
    answered = false;
    if (!questions[currentIdx]) return;
    var q = questions[currentIdx];

    var qWord = document.getElementById('questionWord');
    var pFill = document.getElementById('progressFill');
    var pBar = document.getElementById('progressBar');
    var pLabel = document.getElementById('progressLabel');
    var fbArea = document.getElementById('feedbackArea');

    if (qWord) qWord.innerHTML = highlightFirstVowel(q.word);

    // Atualiza a caixinha complementar de significado (Pedagógico para idosos)
    var mWordDisplay = document.getElementById('meaningWordDisplay');
    var mText = document.getElementById('meaningText');
    if (mWordDisplay) mWordDisplay.innerHTML = highlightFirstVowel(q.word);
    if (mText) {
        var meaning = wordMeanings[q.word] || ('Palavra simples iniciada com a letra ' + q.vowel + '.');
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

    // Reproduz áudio da pergunta com suave delay
    setTimeout(playQuestionAudio, 450);
}

/**
 * Lê o significado da palavra em destaque com voz acolhedora
 */
function playMeaningAudio() {
    if (currentIdx >= questions.length) return;
    var btn = document.getElementById('btnMeaningAudio');
    if (btn) btn.classList.add('speaking');
    var q = questions[currentIdx];
    var word = q.word;
    var meaning = wordMeanings[word] || ('Palavra simples iniciada com a letra ' + q.vowel + '.');
    speak(word + '. ' + meaning, function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playQuestionAudio() {
    if (currentIdx >= questions.length) return;
    var btn = document.getElementById('btnExerciseAudio');
    if (btn) btn.classList.add('speaking');
    var word = questions[currentIdx].word;
    speak('Qual é a primeira vogal da palavra ' + word + '?', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function playHelpExercise() {
    var btn = document.getElementById('btnHelpExercise');
    if (btn) btn.classList.add('speaking');
    speak('Escolha a primeira vogal da palavra que aparece na tela.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function checkAnswer(selected) {
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
                '<button class="btn-next" onclick="nextQuestion()" aria-label="' + label + '">' +
                '<i class="fas ' + icon + '" aria-hidden="true"></i> ' + label + '</button>';
            var nb = document.querySelector('.btn-next');
            if (nb) nb.focus();
        }
    }, correct ? 200 : 800);
}

function nextQuestion() {
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

function showCompletion() {
    var exLayout = document.getElementById('exerciseLayout');
    var compScreen = document.getElementById('completionScreen');
    if (exLayout) exLayout.style.display = 'none';
    if (compScreen) compScreen.classList.add('visible');

    var finalHitsEl = document.getElementById('finalHits');
    var finalMissesEl = document.getElementById('finalMisses');
    var finalTotalEl = document.getElementById('finalTotal');
    var progFill = document.getElementById('progressFill');

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

    salvarProgressoVogais();

    speak('Parabéns! Você terminou! ' + msg);
    announceSR('Atividade concluída. ' + hits + ' acertos de ' + TOTAL + '. ' + msg);
}

// ============================================================================
// PERSISTÊNCIA DE PROGRESSO (LocalStorage + Supabase / AprendIDosAuth)
// ============================================================================
function salvarProgressoVogais() {
    var progData = {
        completed: true,
        score: hits,
        total: TOTAL,
        misses: misses,
        savedAt: new Date().toISOString()
    };

    var user = null;
    try {
        var userRaw = localStorage.getItem('aprendidos_usuario');
        if (userRaw) user = JSON.parse(userRaw);
    } catch(e) {}

    var userKey = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
    var keys = [
        userKey,
        'aprendidos_progresso',
        'aprendidos_progresso_anon'
    ].filter(Boolean);

    keys.forEach(function(k) {
        try {
            var curr = JSON.parse(localStorage.getItem(k) || '{}');
            curr['vogais'] = progData;
            localStorage.setItem(k, JSON.stringify(curr));
        } catch(e) {}
    });

    if (typeof window !== 'undefined' && window.AprendIDosAuth && window.AprendIDosAuth.saveLessonProgress) {
        try {
            window.AprendIDosAuth.saveLessonProgress('vogais', progData);
        } catch(e) {}
    }
}

function salvarEVerOutras(event) {
    if (event) event.preventDefault();
    var btn = document.getElementById('btnSalvarEVerOutras');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Salvando progresso...';
        btn.style.opacity = '0.9';
    }

    salvarProgressoVogais();

    if (btn) {
        btn.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> Salvo com sucesso!';
    }

    setTimeout(function() {
        window.location.href = 'licoes.html';
    }, 450);
}

function verificarLicaoConcluida() {
    var isDone = false;
    var prevScore = null;
    var prevTotal = TOTAL;

    try {
        var user = null;
        try {
            var uRaw = localStorage.getItem('aprendidos_usuario');
            if (uRaw) user = JSON.parse(uRaw);
        } catch(e) {}

        var userKey = (user && user.id) ? ('aprendidos_progresso_' + user.id) : null;
        var keys = [userKey, 'aprendidos_progresso', 'aprendidos_progresso_anon'].filter(Boolean);

        for (var i = 0; i < keys.length; i++) {
            var raw = localStorage.getItem(keys[i]);
            if (raw) {
                var p = JSON.parse(raw);
                if (p && p.vogais && p.vogais.completed) {
                    isDone = true;
                    if (p.vogais.score !== undefined) prevScore = p.vogais.score;
                    if (p.vogais.total !== undefined) prevTotal = p.vogais.total;
                    break;
                }
            }
        }
    } catch(e) {}

    if (isDone) {
        var banner = document.getElementById('reviewBanner');
        var bannerText = document.getElementById('reviewBannerText');
        if (banner) {
            banner.style.display = 'flex';
            if (bannerText) {
                var scoreMsg = prevScore !== null ? ' com <strong>' + prevScore + ' de ' + prevTotal + ' acertos</strong>' : '';
                bannerText.innerHTML = 'Você já concluiu esta lição' + scoreMsg + '! Sinta-se à vontade para rever os sons das vogais e praticar novamente quantas vezes desejar.';
            }
        }
    }
}

function restartExercise() {
    initExercise();
    verificarLicaoConcluida();
}

// ============================================================================
// CONTROLES DE INTERFACE E ACESSIBILIDADE
// ============================================================================
function speakVowel(key) {
    var data = vowelData[key];
    if (!data) return;
    document.querySelectorAll('.vowel-card').forEach(function(c) { c.classList.remove('speaking'); });
    var card = document.querySelector('.vowel-card[data-vowel="' + key + '"]');
    if (card) card.classList.add('speaking');
    speak(data.letter + '. ' + data.letter + ' de ' + data.example + '.', function() {
        if (card) card.classList.remove('speaking');
    });
}

function playInstruction() {
    var btn = document.getElementById('btnInstruction');
    if (btn) btn.classList.add('speaking');
    speak('Ouça e repita cada vogal. Toque nas fotos para ouvir as vogais.', function() {
        if (btn) btn.classList.remove('speaking');
    });
}

function announceSR(text) {
    var el = document.getElementById('srAnnouncer');
    if (el) {
        el.textContent = '';
        setTimeout(function() { el.textContent = text; }, 60);
    }
}

function toggleMenu() {
    var menu = document.getElementById('mobileMenu');
    var btn = document.querySelector('.navbar-hamburger');
    if (menu && btn) {
        var isOpen = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
    }
}

function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
}

// Fecha menu mobile ao clicar fora
document.addEventListener('click', function(e) {
    var menu = document.getElementById('mobileMenu');
    var btn = document.querySelector('.navbar-hamburger');
    if (menu && btn && menu.classList.contains('open') &&
        !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    }
});

// Vincula funções ao escopo global (window) para compatibilidade com os handlers HTML
window.speak = speak;
window.speakVowel = speakVowel;
window.playInstruction = playInstruction;
window.playQuestionAudio = playQuestionAudio;
window.playHelpExercise = playHelpExercise;
window.playMeaningAudio = playMeaningAudio;
window.checkAnswer = checkAnswer;
window.nextQuestion = nextQuestion;
window.restartExercise = restartExercise;
window.salvarProgressoVogais = salvarProgressoVogais;
window.salvarEVerOutras = salvarEVerOutras;
window.verificarLicaoConcluida = verificarLicaoConcluida;
window.toggleMenu = toggleMenu;

// Inicialização segura
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initExercise();
        verificarLicaoConcluida();
    });
} else {
    initExercise();
    verificarLicaoConcluida();
}