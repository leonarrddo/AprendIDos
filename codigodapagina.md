<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AprendIDos — Vogais</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>
        :root {
            --bg: #FAF3E0;
            --bg-card: #F5DEB3;
            --white: #FFFFFF;
            --fg: #3E2723;
            --fg-secondary: #5D4037;
            --muted: #8D6E63;
            --green: #2E7D32;
            --green-light: #C8E6C9;
            --green-pale: #E8F5E9;
            --green-dark: #1B5E20;
            --green-mid: #4CAF50;
            --border: #C8E6C9;
            --radius: 18px;
            --radius-sm: 12px;
            --vowel-a: #D84315;
            --vowel-e: #F9A825;
            --vowel-i: #2E7D32;
            --vowel-o: #1565C0;
            --vowel-u: #6A1B9A;
        }

        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html {
            font-size: 18px;
            scroll-behavior: smooth;
        }

        body {
            font-family: 'Nunito', sans-serif;
            background: var(--bg);
            color: var(--fg);
            line-height: 1.7;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .skip-link {
            position: absolute;
            top: -100%;
            left: 1rem;
            background: var(--green);
            color: #fff;
            padding: 0.8rem 1.4rem;
            border-radius: var(--radius-sm);
            font-weight: 700;
            font-size: 1rem;
            z-index: 200;
            text-decoration: none;
            transition: top 0.2s;
        }
        .skip-link:focus { top: 0.5rem; }

        /* ===== NAVBAR ===== */
        .navbar {
            background: var(--white);
            border-bottom: 3px solid var(--green);
            padding: 0.4rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 6px rgba(0,0,0,0.05);
        }

        .navbar-left {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            flex-shrink: 0;
        }

        .btn-back {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            background: var(--bg);
            border: 2px solid var(--green-light);
            border-radius: var(--radius-sm);
            padding: 0.45rem 0.9rem;
            color: var(--green);
            font-size: 0.95rem;
            font-weight: 700;
            font-family: 'Nunito', sans-serif;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
        }
        .btn-back:hover {
            background: var(--green-pale);
            border-color: var(--green);
        }
        .btn-back:focus-visible {
            outline: 3px solid var(--green);
            outline-offset: 2px;
        }

        .navbar-brand {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            color: var(--fg);
        }

        .brand-icon {
            width: 34px;
            height: 34px;
            background: var(--green);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 1.15rem;
            font-weight: 900;
            flex-shrink: 0;
        }

        .navbar-brand span {
            font-size: 1.15rem;
            font-weight: 900;
            letter-spacing: -0.01em;
        }

        .navbar-nav {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            list-style: none;
            flex-shrink: 0;
        }

        .navbar-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            text-decoration: none;
            color: var(--muted);
            padding: 0.7rem 1.2rem 0.6rem;
            border-radius: 10px;
            transition: all 0.2s;
            min-width: 108px;
        }
        .navbar-nav-item i {
            font-size: 2.3rem;
            line-height: 1;
        }
        .navbar-nav-item span {
            font-size: 1.05rem;
            font-weight: 800;
            line-height: 1.2;
        }
        .navbar-nav-item:hover {
            color: var(--green);
            background: var(--green-pale);
        }
        .navbar-nav-item.active {
            color: var(--green);
            background: var(--green-pale);
        }
        .navbar-nav-item.active i { font-weight: 900; }
        .navbar-nav-item.active span { font-weight: 900; }
        .navbar-nav-item:focus-visible {
            outline: 3px solid var(--green);
            outline-offset: 2px;
        }

        .navbar-hamburger {
            display: none;
            background: none;
            border: 2px solid var(--green-light);
            border-radius: 8px;
            color: var(--green);
            font-size: 1.3rem;
            cursor: pointer;
            padding: 0.4rem 0.7rem;
        }

        .navbar-mobile-menu {
            display: none;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--white);
            border-bottom: 3px solid var(--green);
            padding: 0.8rem 1.2rem;
            gap: 0.3rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            z-index: 99;
        }
        .navbar-mobile-menu.open { display: flex; }
        .navbar-mobile-menu a {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            color: var(--muted);
            text-decoration: none;
            font-weight: 700;
            font-size: 1.2rem;
            padding: 1rem 1.2rem;
            border-radius: 8px;
            transition: all 0.2s;
        }
        .navbar-mobile-menu a i {
            font-size: 1.8rem;
            width: 2rem;
            text-align: center;
        }
        .navbar-mobile-menu a:hover,
        .navbar-mobile-menu a.active {
            color: var(--green);
            background: var(--green-pale);
        }

        /* ===== CONTAINER ===== */
        .container {
            max-width: 920px;
            margin: 0 auto;
            padding: 2rem 1.5rem 3rem;
            flex: 1;
        }

        /* ===== CABEÇALHO ===== */
        .activity-header { margin-bottom: 2rem; }
        .activity-header h1 {
            font-size: 2rem;
            font-weight: 900;
            color: var(--fg);
            margin-bottom: 0.3rem;
            line-height: 1.2;
        }
        .activity-header .subtitle {
            font-size: 1.1rem;
            color: var(--fg-secondary);
            font-weight: 600;
        }

        /* ===== INSTRUÇÃO ===== */
        .instruction-card {
            background: var(--white);
            border: 2px solid var(--border);
            border-radius: var(--radius);
            padding: 1.8rem;
            margin-bottom: 2.5rem;
            display: flex;
            align-items: center;
            gap: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .instruction-card .instruction-text { flex: 1; }
        .instruction-card .instruction-text p {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--fg);
            line-height: 1.6;
        }
        .instruction-card .instruction-text p + p {
            margin-top: 0.3rem;
            font-size: 1rem;
            color: var(--fg-secondary);
            font-weight: 600;
        }

        .btn-play-instruction {
            flex-shrink: 0;
            width: 72px;
            height: 72px;
            border-radius: 50%;
            border: 3px solid var(--green);
            background: var(--green-pale);
            color: var(--green);
            font-size: 1.6rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.25s;
        }
        .btn-play-instruction:hover {
            background: var(--green);
            color: #fff;
            transform: scale(1.05);
        }
        .btn-play-instruction:active { transform: scale(0.97); }
        .btn-play-instruction:focus-visible { outline: 3px solid var(--green); outline-offset: 3px; }
        .btn-play-instruction.speaking {
            background: var(--green);
            color: #fff;
            animation: pulse-green 1s ease infinite;
        }
        @keyframes pulse-green {
            0%, 100% { box-shadow: 0 0 0 0 rgba(46,125,50,0.3); }
            50% { box-shadow: 0 0 0 12px rgba(46,125,50,0); }
        }

        /* ===== SEÇÃO VOGAIS ===== */
        .section-title {
            font-size: 1.4rem;
            font-weight: 800;
            color: var(--fg);
            margin-bottom: 1.2rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .section-title i { color: var(--green); font-size: 1.2rem; }

        .vowels-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 1rem;
            margin-bottom: 2.5rem;
        }

        .vowel-card {
            background: var(--bg-card);
            border: 3px solid var(--border);
            border-radius: var(--radius);
            padding: 1.4rem 0.6rem 1.2rem;
            text-align: center;
            cursor: pointer;
            transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.3rem;
        }
        .vowel-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }
        .vowel-card:focus-visible {
            outline: 3px solid var(--green);
            outline-offset: 3px;
        }
        .vowel-card.speaking {
            border-color: var(--green);
            box-shadow: 0 0 0 4px var(--green-light), 0 6px 18px rgba(46,125,50,0.12);
            transform: scale(1.04);
        }

        .vowel-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 5px;
            border-radius: var(--radius) var(--radius) 0 0;
        }
        .vowel-card[data-vowel="a"]::before { background: var(--vowel-a); }
        .vowel-card[data-vowel="e"]::before { background: var(--vowel-e); }
        .vowel-card[data-vowel="i"]::before { background: var(--vowel-i); }
        .vowel-card[data-vowel="o"]::before { background: var(--vowel-o); }
        .vowel-card[data-vowel="u"]::before { background: var(--vowel-u); }

        .vowel-letter {
            font-size: 3.2rem;
            font-weight: 900;
            line-height: 1;
        }
        .vowel-card[data-vowel="a"] .vowel-letter { color: var(--vowel-a); }
        .vowel-card[data-vowel="e"] .vowel-letter { color: var(--vowel-e); }
        .vowel-card[data-vowel="i"] .vowel-letter { color: var(--vowel-i); }
        .vowel-card[data-vowel="o"] .vowel-letter { color: var(--vowel-o); }
        .vowel-card[data-vowel="u"] .vowel-letter { color: var(--vowel-u); }

        .vowel-illustration {
            width: 76px;
            height: 76px;
            margin: 0.3rem 0;
            flex-shrink: 0;
        }
        .vowel-illustration svg {
            width: 100%;
            height: 100%;
        }

        .vowel-example {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--fg);
            line-height: 1.3;
        }
        .vowel-example .highlight {
            font-weight: 900;
            text-decoration: underline;
            text-decoration-thickness: 2.5px;
            text-underline-offset: 2px;
        }
        .vowel-card[data-vowel="a"] .highlight { color: var(--vowel-a); text-decoration-color: var(--vowel-a); }
        .vowel-card[data-vowel="e"] .highlight { color: var(--vowel-e); text-decoration-color: var(--vowel-e); }
        .vowel-card[data-vowel="i"] .highlight { color: var(--vowel-i); text-decoration-color: var(--vowel-i); }
        .vowel-card[data-vowel="o"] .highlight { color: var(--vowel-o); text-decoration-color: var(--vowel-o); }
        .vowel-card[data-vowel="u"] .highlight { color: var(--vowel-u); text-decoration-color: var(--vowel-u); }

        .vowel-sound-btn {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 2px solid var(--green-light);
            background: var(--white);
            color: var(--green);
            font-size: 1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            margin-top: 0.2rem;
            flex-shrink: 0;
        }
        .vowel-sound-btn:hover {
            background: var(--green);
            color: #fff;
            border-color: var(--green);
        }
        .vowel-sound-btn:focus-visible { outline: 3px solid var(--green); outline-offset: 2px; }

        /* ===== DIVISOR ===== */
        .divider {
            border: none;
            height: 2px;
            background: var(--border);
            margin: 2rem 0 2.5rem;
            border-radius: 1px;
        }

        /* ===== EXERCÍCIO ===== */
        .exercise-card {
            background: var(--white);
            border: 2px solid var(--border);
            border-radius: var(--radius);
            padding: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }

        .progress-label {
            font-size: 1rem;
            font-weight: 700;
            color: var(--muted);
            text-align: center;
            margin-bottom: 0.4rem;
        }
        .progress-bar-track {
            background: var(--green-light);
            border-radius: 99px;
            height: 14px;
            margin-bottom: 1.5rem;
            overflow: hidden;
        }
        .progress-bar-fill {
            height: 100%;
            background: var(--green);
            border-radius: 99px;
            transition: width 0.5s ease;
            width: 0%;
        }

        .score-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 1.8rem;
            flex-wrap: wrap;
        }
        .score-item {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--fg-secondary);
        }
        .score-num {
            font-size: 1.4rem;
            font-weight: 900;
            min-width: 1.5ch;
            text-align: center;
        }
        .score-item.hits .score-num { color: var(--green-dark); }
        .score-item.misses .score-num { color: var(--vowel-a); }

        .exercise-instruction {
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--fg);
            text-align: center;
            margin-bottom: 1.2rem;
        }

        .audio-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
        .btn-audio-exercise {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            background: var(--green);
            color: #fff;
            border: none;
            border-radius: var(--radius-sm);
            padding: 0.9rem 1.8rem;
            font-size: 1.1rem;
            font-weight: 800;
            font-family: 'Nunito', sans-serif;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 3px 10px rgba(46,125,50,0.25);
        }
        .btn-audio-exercise:hover { background: var(--green-dark); }
        .btn-audio-exercise:active { transform: scale(0.97); }
        .btn-audio-exercise:focus-visible { outline: 3px solid var(--green); outline-offset: 3px; }
        .btn-audio-exercise.speaking { animation: pulse-green 0.9s ease infinite; }
        .audio-hint {
            font-size: 0.95rem;
            color: var(--muted);
            font-weight: 600;
        }

        .btn-help-exercise {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 2px solid var(--green-light);
            background: var(--green-pale);
            color: var(--green);
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.2s;
            flex-shrink: 0;
        }
        .btn-help-exercise:hover {
            background: var(--green);
            color: #fff;
            border-color: var(--green);
        }
        .btn-help-exercise:focus-visible { outline: 3px solid var(--green); outline-offset: 2px; }
        .btn-help-exercise.speaking { animation: pulse-green 0.9s ease infinite; }

        .question-area {
            text-align: center;
            margin-bottom: 1.8rem;
        }
        .question-area .question-label {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--fg-secondary);
        }
        .question-area .question-word {
            font-size: 1.7rem;
            font-weight: 900;
            color: var(--fg);
            display: block;
            margin-top: 0.2rem;
        }
        .question-area .question-word .vowel-highlight {
            color: var(--green-dark);
            text-decoration: underline;
            text-decoration-thickness: 3px;
            text-underline-offset: 3px;
        }

        .options-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 0.8rem;
            margin-bottom: 1.2rem;
        }
        .btn-option {
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg);
            border: 3px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 1.1rem 0.5rem;
            font-size: 1.8rem;
            font-weight: 900;
            font-family: 'Nunito', sans-serif;
            color: var(--fg);
            cursor: pointer;
            transition: all 0.2s;
            min-height: 76px;
        }
        .btn-option:hover:not(:disabled) {
            border-color: var(--green);
            background: var(--green-pale);
            transform: translateY(-2px);
        }
        .btn-option:active:not(:disabled) { transform: scale(0.96); }
        .btn-option:focus-visible { outline: 3px solid var(--green); outline-offset: 2px; }
        .btn-option:disabled { cursor: default; opacity: 0.65; }
        .btn-option.correct {
            border-color: var(--green);
            background: var(--green-pale);
            color: var(--green-dark);
            opacity: 1 !important;
            animation: pop-correct 0.35s ease;
        }
        .btn-option.wrong {
            border-color: #EF9A9A;
            background: #FFF3F3;
            color: #C62828;
            opacity: 1 !important;
            animation: shake 0.4s ease;
        }
        @keyframes pop-correct {
            0% { transform: scale(1); }
            50% { transform: scale(1.07); }
            100% { transform: scale(1); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-5px); }
            40% { transform: translateX(5px); }
            60% { transform: translateX(-3px); }
            80% { transform: translateX(3px); }
        }

        /* ===== FEEDBACK ===== */
        .feedback-area {
            text-align: center;
            min-height: 3.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.8rem;
        }
        .feedback-msg {
            font-size: 1.3rem;
            font-weight: 800;
            border-radius: var(--radius-sm);
            padding: 0.7rem 1.5rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            animation: fade-up 0.3s ease;
        }
        @keyframes fade-up {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .feedback-msg.success {
            background: var(--green-pale);
            color: var(--green-dark);
            border: 2px solid var(--green-light);
        }
        .feedback-msg.error {
            background: #FFF8E1;
            color: #E65100;
            border: 2px solid #FFE0B2;
        }
        .btn-next {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--green);
            color: #fff;
            border: none;
            border-radius: var(--radius-sm);
            padding: 0.85rem 2rem;
            font-size: 1.05rem;
            font-weight: 800;
            font-family: 'Nunito', sans-serif;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 3px 8px rgba(46,125,50,0.2);
        }
        .btn-next:hover { background: var(--green-dark); }
        .btn-next:active { transform: scale(0.97); }
        .btn-next:focus-visible { outline: 3px solid var(--green); outline-offset: 3px; }

        /* ===== CONCLUSÃO ===== */
        .completion {
            text-align: center;
            padding: 2.5rem 1.5rem;
            display: none;
        }
        .completion.visible { display: block; animation: fade-up 0.4s ease; }
        .completion-icon { font-size: 3.5rem; color: var(--green); margin-bottom: 0.8rem; }
        .completion h2 { font-size: 1.8rem; font-weight: 900; color: var(--fg); margin-bottom: 0.4rem; }
        .completion p { font-size: 1.1rem; color: var(--fg-secondary); font-weight: 600; margin-bottom: 2rem; }
        .completion-stats {
            display: flex;
            justify-content: center;
            gap: 2.5rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        .stat { text-align: center; }
        .stat-value { font-size: 2.5rem; font-weight: 900; line-height: 1; }
        .stat-label { font-size: 0.95rem; font-weight: 700; color: var(--muted); margin-top: 0.2rem; }

        .error-summary {
            background: #FFF8E1;
            border: 2px solid #FFE0B2;
            border-radius: var(--radius-sm);
            padding: 1.2rem 1.5rem;
            margin-bottom: 2rem;
            text-align: left;
            max-width: 480px;
            margin-left: auto;
            margin-right: auto;
        }
        .error-summary h3 {
            font-size: 1.05rem;
            font-weight: 800;
            color: #E65100;
            margin-bottom: 0.6rem;
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .error-summary ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .error-summary li {
            font-size: 1rem;
            font-weight: 700;
            color: var(--fg-secondary);
            padding: 0.25rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .error-summary li .wrong-answer {
            color: #C62828;
            text-decoration: line-through;
            font-weight: 800;
        }
        .error-summary li .correct-answer {
            color: var(--green-dark);
            font-weight: 900;
        }
        .error-summary li .arrow { color: var(--muted); }

        .btn-restart {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--green);
            color: #fff;
            border: none;
            border-radius: var(--radius-sm);
            padding: 1rem 2.5rem;
            font-size: 1.1rem;
            font-weight: 800;
            font-family: 'Nunito', sans-serif;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 3px 10px rgba(46,125,50,0.25);
        }
        .btn-restart:hover { background: var(--green-dark); }
        .btn-restart:active { transform: scale(0.97); }
        .btn-restart:focus-visible { outline: 3px solid var(--green); outline-offset: 3px; }

        /* ===== FOOTER ===== */
        .footer {
            background: var(--white);
            border-top: 2px solid var(--border);
            padding: 1.2rem 1.5rem;
            text-align: center;
            font-size: 0.9rem;
            color: var(--muted);
            font-weight: 600;
        }
        .footer i { color: var(--green); }

        /* ===== RESPONSIVIDADE ===== */
        @media (max-width: 768px) {
            .navbar-nav { display: none; }
            .navbar-hamburger { display: flex; align-items: center; justify-content: center; }
        }
        @media (max-width: 720px) {
            html { font-size: 16px; }
            .activity-header h1 { font-size: 1.6rem; }
            .vowels-grid { grid-template-columns: repeat(3, 1fr); gap: 0.8rem; }
            .vowel-letter { font-size: 2.6rem; }
            .vowel-illustration { width: 62px; height: 62px; }
            .exercise-card { padding: 1.5rem 1rem; }
            .options-grid { gap: 0.5rem; }
            .btn-option { font-size: 1.4rem; padding: 0.9rem 0.3rem; min-height: 65px; }
            .instruction-card { flex-direction: column; text-align: center; gap: 1rem; }
        }
        @media (max-width: 440px) {
            .vowels-grid { grid-template-columns: repeat(2, 1fr); }
            .vowels-grid .vowel-card:nth-child(5) {
                grid-column: 1 / -1;
                max-width: 50%;
                justify-self: center;
            }
            .options-grid {
                grid-template-columns: repeat(5, 1fr);
                gap: 0.35rem;
            }
            .btn-option {
                font-size: 1.2rem;
                padding: 0.75rem 0.1rem;
                min-height: 58px;
            }
            .btn-audio-exercise { padding: 0.8rem 1.3rem; font-size: 1rem; }
            .score-row { gap: 1rem; }
        }

        /* ===== ACESSIBILIDADE ===== */
        *:focus-visible {
            outline: 3px solid var(--green);
            outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
        .sr-only {
            position: absolute;
            width: 1px; height: 1px;
            padding: 0; margin: -1px;
            overflow: hidden;
            clip: rect(0,0,0,0);
            white-space: nowrap;
            border: 0;
        }
    </style>
</head>
<body>

<a href="#main-content" class="skip-link">Pular para o conteúdo</a>

<!-- ===== NAVBAR ===== -->
<nav class="navbar" role="navigation" aria-label="Navegação principal">
    <div class="navbar-left">
        <a href="#" class="btn-back" aria-label="Voltar">
            <i class="fas fa-arrow-left" aria-hidden="true"></i>
            Voltar
        </a>
        <a href="#" class="navbar-brand" aria-label="AprendIDos">
            <div class="brand-icon" aria-hidden="true">A</div>
            <span>AprendIDos</span>
        </a>
    </div>

    <div class="navbar-nav" role="menubar">
        <a href="#" class="navbar-nav-item" role="menuitem" aria-label="Início">
            <i class="fas fa-home" aria-hidden="true"></i>
            <span>Início</span>
        </a>
        <a href="#" class="navbar-nav-item" role="menuitem" aria-label="Módulos">
            <i class="fas fa-book" aria-hidden="true"></i>
            <span>Módulos</span>
        </a>
        <a href="#" class="navbar-nav-item active" role="menuitem" aria-current="page" aria-label="Atividades">
            <i class="fas fa-puzzle-piece" aria-hidden="true"></i>
            <span>Atividades</span>
        </a>
    </div>

    <button class="navbar-hamburger" aria-label="Abrir menu" aria-expanded="false" onclick="toggleMenu()">
        <i class="fas fa-bars"></i>
    </button>

    <div class="navbar-mobile-menu" id="mobileMenu">
        <a href="#" role="menuitem">
            <i class="fas fa-home" aria-hidden="true"></i>
            Início
        </a>
        <a href="#" role="menuitem">
            <i class="fas fa-book" aria-hidden="true"></i>
            Módulos
        </a>
        <a href="#" class="active" role="menuitem" aria-current="page">
            <i class="fas fa-puzzle-piece" aria-hidden="true"></i>
            Atividades
        </a>
    </div>
</nav>

<!-- CONTEÚDO -->
<main class="container" id="main-content">

    <header class="activity-header">
        <h1>Conhecendo as Vogais</h1>
        <p class="subtitle">Toque para ouvir e aprender as cinco vogais.</p>
    </header>

    <div class="instruction-card">
        <div class="instruction-text">
            <p>Ouça e repita cada vogal.</p>
            <p>Toque no botão para começar.</p>
        </div>
        <button class="btn-play-instruction" id="btnInstruction" aria-label="Ouvir instrução" onclick="playInstruction()">
            <i class="fas fa-play" aria-hidden="true"></i>
        </button>
    </div>

    <section aria-labelledby="title-vowels">
        <h2 class="section-title" id="title-vowels">
            <i class="fas fa-star" aria-hidden="true"></i>
            Conheça as Vogais
        </h2>

        <div class="vowels-grid" role="list">

            <!-- VOGAL A — Avião -->
            <div class="vowel-card" data-vowel="a" role="listitem" tabindex="0"
                 aria-label="Vogal A, A de Avião"
                 onclick="speakVowel('a')"
                 onkeydown="if(event.key==='Enter')speakVowel('a')">
                <div class="vowel-letter" aria-hidden="true">A</div>
                <div class="vowel-illustration" aria-hidden="true">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="40" cy="38" rx="28" ry="9" fill="#FFCCBC" stroke="#D84315" stroke-width="2.5"/>
                        <path d="M30 33 L40 14 L50 33" fill="#FFAB91" stroke="#D84315" stroke-width="2.5" stroke-linejoin="round"/>
                        <path d="M32 43 L40 58 L48 43" fill="#FFAB91" stroke="#D84315" stroke-width="2.5" stroke-linejoin="round"/>
                        <rect x="60" y="22" width="5" height="18" rx="2" fill="#FFAB91" stroke="#D84315" stroke-width="2"/>
                        <path d="M62 28 L72 24 L72 32 Z" fill="#FFAB91" stroke="#D84315" stroke-width="2" stroke-linejoin="round"/>
                        <line x1="10" y1="34" x2="10" y2="42" stroke="#D84315" stroke-width="2.5" stroke-linecap="round"/>
                        <line x1="7" y1="32" x2="13" y2="44" stroke="#D84315" stroke-width="2.5" stroke-linecap="round"/>
                        <circle cx="10" cy="38" r="2.5" fill="#D84315"/>
                        <circle cx="22" cy="36" r="2.5" fill="#FFF3E0" stroke="#D84315" stroke-width="1.5"/>
                        <circle cx="30" cy="36" r="2.5" fill="#FFF3E0" stroke="#D84315" stroke-width="1.5"/>
                        <circle cx="38" cy="36" r="2.5" fill="#FFF3E0" stroke="#D84315" stroke-width="1.5"/>
                        <circle cx="46" cy="36" r="2.5" fill="#FFF3E0" stroke="#D84315" stroke-width="1.5"/>
                        <circle cx="54" cy="36" r="2.5" fill="#FFF3E0" stroke="#D84315" stroke-width="1.5"/>
                    </svg>
                </div>
                <div class="vowel-example"><span class="highlight">A</span> de Avião</div>
                <button class="vowel-sound-btn" aria-label="Ouvir a vogal A"
                        onclick="event.stopPropagation(); speakVowel('a')">
                    <i class="fas fa-volume-up" aria-hidden="true"></i>
                </button>
            </div>

            <!-- VOGAL E — Escada -->
            <div class="vowel-card" data-vowel="e" role="listitem" tabindex="0"
                 aria-label="Vogal E, E de Escada"
                 onclick="speakVowel('e')"
                 onkeydown="if(event.key==='Enter')speakVowel('e')">
                <div class="vowel-letter" aria-hidden="true">E</div>
                <div class="vowel-illustration" aria-hidden="true">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="12" y="62" width="56" height="7" rx="2" fill="#FFF9C4" stroke="#F9A825" stroke-width="2.5"/>
                        <rect x="12" y="50" width="44" height="7" rx="2" fill="#FFF9C4" stroke="#F9A825" stroke-width="2.5"/>
                        <rect x="12" y="38" width="32" height="7" rx="2" fill="#FFF9C4" stroke="#F9A825" stroke-width="2.5"/>
                        <rect x="12" y="26" width="20" height="7" rx="2" fill="#FFF9C4" stroke="#F9A825" stroke-width="2.5"/>
                        <rect x="12" y="14" width="8" height="7" rx="2" fill="#FFF9C4" stroke="#F9A825" stroke-width="2.5"/>
                        <rect x="56" y="50" width="12" height="12" rx="1" fill="#FFE082" stroke="#F9A825" stroke-width="2"/>
                        <rect x="44" y="38" width="12" height="12" rx="1" fill="#FFE082" stroke="#F9A825" stroke-width="2"/>
                        <rect x="32" y="26" width="12" height="12" rx="1" fill="#FFE082" stroke="#F9A825" stroke-width="2"/>
                        <rect x="20" y="14" width="12" height="12" rx="1" fill="#FFE082" stroke="#F9A825" stroke-width="2"/>
                        <line x1="12" y1="14" x2="12" y2="69" stroke="#F9A825" stroke-width="3" stroke-linecap="round"/>
                        <line x1="68" y1="62" x2="20" y2="14" stroke="#F9A825" stroke-width="3" stroke-linecap="round"/>
                        <line x1="68" y1="62" x2="68" y2="69" stroke="#F9A825" stroke-width="3" stroke-linecap="round"/>
                        <line x1="20" y1="14" x2="20" y2="21" stroke="#F9A825" stroke-width="2.5" stroke-linecap="round"/>
                        <line x1="32" y1="26" x2="32" y2="33" stroke="#F9A825" stroke-width="2.5" stroke-linecap="round"/>
                        <line x1="44" y1="38" x2="44" y2="45" stroke="#F9A825" stroke-width="2.5" stroke-linecap="round"/>
                        <line x1="56" y1="50" x2="56" y2="57" stroke="#F9A825" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="vowel-example"><span class="highlight">E</span> de Escada</div>
                <button class="vowel-sound-btn" aria-label="Ouvir a vogal E"
                        onclick="event.stopPropagation(); speakVowel('e')">
                    <i class="fas fa-volume-up" aria-hidden="true"></i>
                </button>
            </div>

            <!-- VOGAL I — Ilha -->
            <div class="vowel-card" data-vowel="i" role="listitem" tabindex="0"
                 aria-label="Vogal I, I de Ilha"
                 onclick="speakVowel('i')"
                 onkeydown="if(event.key==='Enter')speakVowel('i')">
                <div class="vowel-letter" aria-hidden="true">I</div>
                <div class="vowel-illustration" aria-hidden="true">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="80" height="80" rx="4" fill="#E3F2FD"/>
                        <circle cx="66" cy="14" r="8" fill="#FFF9C4" stroke="#F9A825" stroke-width="2"/>
                        <path d="M0 52 Q10 48 20 52 Q30 56 40 52 Q50 48 60 52 Q70 56 80 52 L80 80 L0 80 Z" fill="#90CAF9"/>
                        <path d="M0 58 Q10 54 20 58 Q30 62 40 58 Q50 54 60 58 Q70 62 80 58" stroke="#64B5F6" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <path d="M0 66 Q10 62 20 66 Q30 70 40 66 Q50 62 60 66 Q70 70 80 66" stroke="#64B5F6" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <ellipse cx="38" cy="52" rx="24" ry="10" fill="#FFF9C4" stroke="#FBC02D" stroke-width="2"/>
                        <path d="M38 48 Q36 34 40 20" stroke="#795548" stroke-width="4" stroke-linecap="round" fill="none"/>
                        <path d="M40 20 Q28 10 20 14" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" fill="none"/>
                        <path d="M40 20 Q52 10 60 14" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" fill="none"/>
                        <path d="M40 20 Q34 6 40 4" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" fill="none"/>
                        <path d="M40 20 Q50 14 54 18" stroke="#388E3C" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                        <path d="M40 20 Q30 14 26 18" stroke="#388E3C" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                        <circle cx="40" cy="22" r="3" fill="#795548"/>
                    </svg>
                </div>
                <div class="vowel-example"><span class="highlight">I</span> de Ilha</div>
                <button class="vowel-sound-btn" aria-label="Ouvir a vogal I"
                        onclick="event.stopPropagation(); speakVowel('i')">
                    <i class="fas fa-volume-up" aria-hidden="true"></i>
                </button>
            </div>

            <!-- VOGAL O — Ônibus -->
            <div class="vowel-card" data-vowel="o" role="listitem" tabindex="0"
                 aria-label="Vogal O, O de Ônibus"
                 onclick="speakVowel('o')"
                 onkeydown="if(event.key==='Enter')speakVowel('o')">
                <div class="vowel-letter" aria-hidden="true">O</div>
                <div class="vowel-illustration" aria-hidden="true">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="8" y="16" width="60" height="42" rx="6" fill="#BBDEFB" stroke="#1565C0" stroke-width="2.5"/>
                        <rect x="52" y="22" width="12" height="16" rx="3" fill="#E3F2FD" stroke="#1565C0" stroke-width="2"/>
                        <line x1="8" y1="42" x2="68" y2="42" stroke="#1565C0" stroke-width="2"/>
                        <rect x="14" y="22" width="10" height="12" rx="2" fill="#E3F2FD" stroke="#1565C0" stroke-width="2"/>
                        <rect x="28" y="22" width="10" height="12" rx="2" fill="#E3F2FD" stroke="#1565C0" stroke-width="2"/>
                        <rect x="42" y="22" width="8" height="12" rx="2" fill="#E3F2FD" stroke="#1565C0" stroke-width="2"/>
                        <rect x="28" y="46" width="10" height="12" rx="2" fill="#E3F2FD" stroke="#1565C0" stroke-width="2"/>
                        <circle cx="36" cy="52" r="1.5" fill="#1565C0"/>
                        <rect x="4" y="48" width="6" height="8" rx="2" fill="#90CAF9" stroke="#1565C0" stroke-width="2"/>
                        <circle cx="7" cy="50" r="2" fill="#EF5350"/>
                        <circle cx="22" cy="60" r="7" fill="#E3F2FD" stroke="#1565C0" stroke-width="2.5"/>
                        <circle cx="22" cy="60" r="3" fill="#1565C0"/>
                        <circle cx="54" cy="60" r="7" fill="#E3F2FD" stroke="#1565C0" stroke-width="2.5"/>
                        <circle cx="54" cy="60" r="3" fill="#1565C0"/>
                        <line x1="2" y1="67" x2="72" y2="67" stroke="#90CAF9" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="vowel-example"><span class="highlight">O</span> de Ônibus</div>
                <button class="vowel-sound-btn" aria-label="Ouvir a vogal O"
                        onclick="event.stopPropagation(); speakVowel('o')">
                    <i class="fas fa-volume-up" aria-hidden="true"></i>
                </button>
            </div>

            <!-- VOGAL U — Urso -->
            <div class="vowel-card" data-vowel="u" role="listitem" tabindex="0"
                 aria-label="Vogal U, U de Urso"
                 onclick="speakVowel('u')"
                 onkeydown="if(event.key==='Enter')speakVowel('u')">
                <div class="vowel-letter" aria-hidden="true">U</div>
                <div class="vowel-illustration" aria-hidden="true">
                    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="24" cy="20" r="12" fill="#CE93D8" stroke="#6A1B9A" stroke-width="2.5"/>
                        <circle cx="24" cy="20" r="6" fill="#E1BEE7" stroke="#6A1B9A" stroke-width="1.5"/>
                        <circle cx="56" cy="20" r="12" fill="#CE93D8" stroke="#6A1B9A" stroke-width="2.5"/>
                        <circle cx="56" cy="20" r="6" fill="#E1BEE7" stroke="#6A1B9A" stroke-width="1.5"/>
                        <circle cx="40" cy="44" r="24" fill="#CE93D8" stroke="#6A1B9A" stroke-width="2.5"/>
                        <ellipse cx="40" cy="52" rx="14" ry="11" fill="#E1BEE7"/>
                        <circle cx="32" cy="38" r="4" fill="#4A148C"/>
                        <circle cx="33" cy="37" r="1.5" fill="#fff"/>
                        <circle cx="48" cy="38" r="4" fill="#4A148C"/>
                        <circle cx="49" cy="37" r="1.5" fill="#fff"/>
                        <ellipse cx="40" cy="48" rx="5" ry="3.5" fill="#4A148C"/>
                        <circle cx="38" cy="48" r="1.2" fill="#E1BEE7"/>
                        <circle cx="42" cy="48" r="1.2" fill="#E1BEE7"/>
                        <path d="M34 54 Q40 60 46 54" stroke="#4A148C" stroke-width="2" fill="none" stroke-linecap="round"/>
                        <circle cx="22" cy="48" r="4" fill="#F3E5F5" opacity="0.6"/>
                        <circle cx="58" cy="48" r="4" fill="#F3E5F5" opacity="0.6"/>
                    </svg>
                </div>
                <div class="vowel-example"><span class="highlight">U</span> de Urso</div>
                <button class="vowel-sound-btn" aria-label="Ouvir a vogal U"
                        onclick="event.stopPropagation(); speakVowel('u')">
                    <i class="fas fa-volume-up" aria-hidden="true"></i>
                </button>
            </div>

        </div>
    </section>

    <hr class="divider" aria-hidden="true">

    <!-- EXERCÍCIO -->
    <section aria-labelledby="title-exercise">
        <h2 class="section-title" id="title-exercise">
            <i class="fas fa-pencil-alt" aria-hidden="true"></i>
            Agora é sua vez
        </h2>

        <div class="exercise-card" id="exerciseCard">
            <p class="progress-label" id="progressLabel">Pergunta 1 de 10</p>
            <div class="progress-bar-track" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="progressBar">
                <div class="progress-bar-fill" id="progressFill"></div>
            </div>

            <div class="score-row">
                <div class="score-item hits">
                    <i class="fas fa-check-circle" style="color:var(--green)" aria-hidden="true"></i>
                    <span>Acertos:</span>
                    <span class="score-num" id="hitsCount" aria-live="polite">0</span>
                </div>
                <div class="score-item misses">
                    <i class="fas fa-times-circle" style="color:var(--vowel-a)" aria-hidden="true"></i>
                    <span>Erros:</span>
                    <span class="score-num" id="missesCount" aria-live="polite">0</span>
                </div>
            </div>

            <p class="exercise-instruction">Escolha a <strong>primeira</strong> vogal da palavra.</p>

            <div class="audio-row">
                <button class="btn-audio-exercise" id="btnExerciseAudio" onclick="playQuestionAudio()" aria-label="Ouvir a pergunta completa">
                    <i class="fas fa-volume-up" aria-hidden="true"></i>
                    Ouvir a palavra
                </button>
                <button class="btn-help-exercise" id="btnHelpExercise" onclick="playHelpExercise()" aria-label="Ouvir a instrução do exercício" title="Ouvir instrução">
                    <i class="fas fa-play" aria-hidden="true"></i>
                </button>
                <span class="audio-hint">Toque para ouvir</span>
            </div>

            <div class="question-area">
                <span class="question-label">Qual é a <strong>primeira</strong> vogal da palavra:</span>
                <span class="question-word" id="questionWord">——</span>
            </div>

            <div class="options-grid" role="group" aria-label="Opções de vogais">
                <button class="btn-option" data-vowel="A" onclick="checkAnswer('A')" aria-label="Vogal A">A</button>
                <button class="btn-option" data-vowel="E" onclick="checkAnswer('E')" aria-label="Vogal E">E</button>
                <button class="btn-option" data-vowel="I" onclick="checkAnswer('I')" aria-label="Vogal I">I</button>
                <button class="btn-option" data-vowel="O" onclick="checkAnswer('O')" aria-label="Vogal O">O</button>
                <button class="btn-option" data-vowel="U" onclick="checkAnswer('U')" aria-label="Vogal U">U</button>
            </div>

            <div class="feedback-area" id="feedbackArea" aria-live="polite" aria-atomic="true"></div>
        </div>

        <div class="completion" id="completionScreen">
            <div class="completion-icon"><i class="fas fa-trophy" aria-hidden="true"></i></div>
            <h2>Parabéns! Você terminou!</h2>
            <p id="completionMsg">Veja como você se saiu.</p>
            <div class="completion-stats">
                <div class="stat">
                    <div class="stat-value" style="color:var(--green-dark)" id="finalHits">0</div>
                    <div class="stat-label">Acertos</div>
                </div>
                <div class="stat">
                    <div class="stat-value" style="color:var(--vowel-a)" id="finalMisses">0</div>
                    <div class="stat-label">Erros</div>
                </div>
                <div class="stat">
                    <div class="stat-value" style="color:var(--green)" id="finalTotal">0</div>
                    <div class="stat-label">Total</div>
                </div>
            </div>

            <div class="error-summary" id="errorSummary" style="display:none;">
                <h3><i class="fas fa-exclamation-triangle" aria-hidden="true"></i> Palavras para revisar</h3>
                <ul id="errorList"></ul>
            </div>

            <button class="btn-restart" onclick="restartExercise()" aria-label="Refazer a atividade">
                <i class="fas fa-redo" aria-hidden="true"></i>
                Refazer atividade
            </button>
        </div>
    </section>
</main>

<footer class="footer">
    <i class="fas fa-seedling" aria-hidden="true"></i>
    AprendIDos — Alfabetização para todos
</footer>

<div id="srAnnouncer" class="sr-only" aria-live="polite" aria-atomic="true"></div>

<script>
    var vowelData = {
        a: { letter: 'A', example: 'Avião' },
        e: { letter: 'E', example: 'Escada' },
        i: { letter: 'I', example: 'Ilha' },
        o: { letter: 'O', example: 'Ônibus' },
        u: { letter: 'U', example: 'Urso' }
    };

    var wordBank = [
        { word: 'Abelha', vowel: 'A' },
        { word: 'Escola', vowel: 'E' },
        { word: 'Inseto', vowel: 'I' },
        { word: 'Ovelha', vowel: 'O' },
        { word: 'Uva', vowel: 'U' },
        { word: 'Árvore', vowel: 'A' },
        { word: 'Elefante', vowel: 'E' },
        { word: 'Igreja', vowel: 'I' },
        { word: 'Ouro', vowel: 'O' },
        { word: 'Unha', vowel: 'U' },
        { word: 'Amigo', vowel: 'A' },
        { word: 'Estrela', vowel: 'E' },
        { word: 'Iluminar', vowel: 'I' },
        { word: 'Olho', vowel: 'O' },
        { word: 'Urubu', vowel: 'U' }
    ];

    var questions = [];
    var currentIdx = 0;
    var hits = 0;
    var misses = 0;
    var answered = false;
    var errorLog = [];
    var TOTAL = 10;

    var allVowels = 'AEIOUÁÉÍÓÚÃÕÂÊÎÔÛaeiouáéíóúãõâêîôû';

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

    function initExercise() {
        questions = shuffle([...wordBank]).slice(0, TOTAL);
        currentIdx = 0;
        hits = 0;
        misses = 0;
        answered = false;
        errorLog = [];
        document.getElementById('hitsCount').textContent = '0';
        document.getElementById('missesCount').textContent = '0';
        document.getElementById('exerciseCard').style.display = 'block';
        document.getElementById('completionScreen').classList.remove('visible');
        loadQuestion();
    }

    function loadQuestion() {
        answered = false;
        var q = questions[currentIdx];
        document.getElementById('questionWord').innerHTML = highlightFirstVowel(q.word);
        var pct = (currentIdx / TOTAL) * 100;
        document.getElementById('progressFill').style.width = pct + '%';
        document.getElementById('progressBar').setAttribute('aria-valuenow', Math.round(pct));
        document.getElementById('progressLabel').textContent = 'Pergunta ' + (currentIdx + 1) + ' de ' + TOTAL;
        document.getElementById('feedbackArea').innerHTML = '';
        document.querySelectorAll('.btn-option').forEach(function(btn) {
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong');
        });
        setTimeout(function() { playQuestionAudio(); }, 350);
    }

    function playQuestionAudio() {
        if (currentIdx >= questions.length) return;
        var btn = document.getElementById('btnExerciseAudio');
        btn.classList.add('speaking');
        var word = questions[currentIdx].word;
        speak('Qual é a primeira vogal da palavra ' + word + '?', function() {
            btn.classList.remove('speaking');
        });
    }

    function playHelpExercise() {
        var btn = document.getElementById('btnHelpExercise');
        btn.classList.add('speaking');
        speak('Escolha a primeira vogal da palavra que aparece na tela.', function() {
            btn.classList.remove('speaking');
        });
    }

    function checkAnswer(selected) {
        if (answered) return;
        answered = true;
        var q = questions[currentIdx];
        var correct = selected === q.vowel;

        document.querySelectorAll('.btn-option').forEach(function(b) { b.disabled = true; });

        var selBtn = document.querySelector('.btn-option[data-vowel="' + selected + '"]');
        selBtn.classList.add(correct ? 'correct' : 'wrong');

        if (!correct) {
            document.querySelector('.btn-option[data-vowel="' + q.vowel + '"]').classList.add('correct');
            errorLog.push({ word: q.word, correctVowel: q.vowel, chosenVowel: selected });
        }

        if (correct) {
            hits++;
            document.getElementById('hitsCount').textContent = hits;
            showFeedback('success', 'Muito bem!');
            speak('Muito bem!');
        } else {
            misses++;
            document.getElementById('missesCount').textContent = misses;
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
            document.getElementById('feedbackArea').innerHTML +=
                '<button class="btn-next" onclick="nextQuestion()" aria-label="' + label + '">' +
                '<i class="fas ' + icon + '" aria-hidden="true"></i> ' + label + '</button>';
            var nb = document.querySelector('.btn-next');
            if (nb) nb.focus();
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
        document.getElementById('feedbackArea').innerHTML =
            '<div class="feedback-msg ' + type + '" role="alert">' +
            '<i class="fas ' + icon + '" aria-hidden="true"></i> ' + msg + '</div>';
    }

    function showCompletion() {
        document.getElementById('exerciseCard').style.display = 'none';
        document.getElementById('completionScreen').classList.add('visible');
        document.getElementById('finalHits').textContent = hits;
        document.getElementById('finalMisses').textContent = misses;
        document.getElementById('finalTotal').textContent = TOTAL;
        document.getElementById('progressFill').style.width = '100%';

        var msg;
        if (hits === TOTAL) msg = 'Perfeito! Você acertou todas!';
        else if (hits >= 7) msg = 'Muito bom! Continue assim!';
        else if (hits >= 5) msg = 'Bom trabalho! Revise e tente de novo.';
        else msg = 'Não desista! Refaça e vai ficar melhor.';
        document.getElementById('completionMsg').textContent = msg;

        var errorSummaryEl = document.getElementById('errorSummary');
        var errorListEl = document.getElementById('errorList');
        errorListEl.innerHTML = '';

        if (errorLog.length > 0) {
            errorSummaryEl.style.display = 'block';
            errorLog.forEach(function(err) {
                var li = document.createElement('li');
                li.innerHTML = err.word +
                    ' — você escolheu <span class="wrong-answer">' + err.chosenVowel + '</span>' +
                    ' <span class="arrow"><i class="fas fa-arrow-right" aria-hidden="true"></i></span> ' +
                    'o correto é <span class="correct-answer">' + err.correctVowel + '</span>';
                errorListEl.appendChild(li);
            });
        } else {
            errorSummaryEl.style.display = 'none';
        }

        speak('Parabéns! Você terminou! ' + msg);
        announceSR('Atividade concluída. ' + hits + ' acertos de ' + TOTAL + '. ' + msg);

        setTimeout(function() {
            var b = document.querySelector('.btn-restart');
            if (b) b.focus();
        }, 300);
    }

    function restartExercise() { initExercise(); }

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
        btn.classList.add('speaking');
        speak('Ouça e repita cada vogal. Toque nos cards para aprender.', function() {
            btn.classList.remove('speaking');
        });
    }

    function speak(text, onEnd) {
        if (!('speechSynthesis' in window)) {
            if (onEnd) onEnd();
            return;
        }
        window.speechSynthesis.cancel();
        document.querySelectorAll('.speaking').forEach(function(el) {
            el.classList.remove('speaking');
        });
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'pt-BR';
        u.rate = 0.82;
        u.pitch = 1.0;
        u.volume = 1.0;
        var voices = window.speechSynthesis.getVoices();
        var ptVoice = voices.find(function(v) { return v.lang.startsWith('pt'); });
        if (ptVoice) u.voice = ptVoice;
        if (onEnd) u.onend = onEnd;
        u.onerror = function() {
            document.querySelectorAll('.speaking').forEach(function(el) {
                el.classList.remove('speaking');
            });
        };
        window.speechSynthesis.speak(u);
    }

    function announceSR(text) {
        var el = document.getElementById('srAnnouncer');
        el.textContent = '';
        setTimeout(function() { el.textContent = text; }, 60);
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

    function toggleMenu() {
        var menu = document.getElementById('mobileMenu');
        var btn = document.querySelector('.navbar-hamburger');
        var isOpen = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
    }

    document.addEventListener('click', function(e) {
        var menu = document.getElementById('mobileMenu');
        var btn = document.querySelector('.navbar-hamburger');
        if (menu.classList.contains('open') &&
            !menu.contains(e.target) &&
            !btn.contains(e.target)) {
            menu.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        }
    });

    document.querySelector('.options-grid').addEventListener('keydown', function(e) {
        var btns = Array.from(this.querySelectorAll('.btn-option:not(:disabled)'));
        var idx = btns.indexOf(document.activeElement);
        if (idx < 0) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            btns[(idx + 1) % btns.length].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            btns[(idx - 1 + btns.length) % btns.length].focus();
        }
    });

    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = function() {
            window.speechSynthesis.getVoices();
        };
    }

    initExercise();
</script>
</body>
</html>