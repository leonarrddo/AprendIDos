import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve('c:/Users/leo/Desktop/AprendIDos');

test('CSP in all updated learning modules must contain media-src with Google Translate TTS', () => {
    const htmlFiles = [
        'silabas.html',
        'consoantes.html',
        'frases.html',
        'leituras.html',
        'escrita.html'
    ];

    for (const file of htmlFiles) {
        const content = fs.readFileSync(path.join(rootDir, file), 'utf-8');
        assert.ok(
            content.includes("media-src 'self' data: blob: https://translate.google.com;"),
            `${file} must allow media-src for translate.google.com in CSP`
        );
    }
});

test('All updated JS modules must implement stopAllAudio and anti-repetition speech control', () => {
    const jsFiles = [
        'silabas.js',
        'consoantes.js',
        'frases.js',
        'leituras.js',
        'escrita.js'
    ];

    for (const file of jsFiles) {
        const content = fs.readFileSync(path.join(rootDir, file), 'utf-8');
        assert.ok(
            content.includes('function stopAllAudio()') || content.includes('stopAllAudio'),
            `${file} must have stopAllAudio`
        );
        assert.ok(
            content.includes('speechGeneration') || content.includes('usedFallback') || content.includes('fallbackTriggered'),
            `${file} must have race-condition / repetition guard for speech`
        );
    }
});

test('Frases module has difficulty levels (facil, medio, dificil) and extensive phrase bank', () => {
    const frasesJs = fs.readFileSync(path.join(rootDir, 'frases.js'), 'utf-8');
    const frasesHtml = fs.readFileSync(path.join(rootDir, 'frases.html'), 'utf-8');

    assert.ok(frasesJs.includes("level: 'facil'"), 'frases.js must include facil phrases');
    assert.ok(frasesJs.includes("level: 'medio'"), 'frases.js must include medio phrases');
    assert.ok(frasesJs.includes("level: 'dificil'"), 'frases.js must include dificil phrases');

    // Count number of phrases in frasesBank
    const phraseMatches = frasesJs.match(/text:\s*['"]/g);
    assert.ok(phraseMatches && phraseMatches.length >= 20, 'frases.js should have at least 20 phrases');

    // Verify UI has filter tabs and level badge
    assert.ok(frasesHtml.includes('btn-filter-tab'), 'frases.html must contain level filter tabs');
    assert.ok(frasesHtml.includes('phraseLevelBadge'), 'frases.html must contain phraseLevelBadge');
});

test('Leituras module has reading aids, vocabulary chips, and expanded stories', () => {
    const leiturasJs = fs.readFileSync(path.join(rootDir, 'leituras.js'), 'utf-8');
    const leiturasHtml = fs.readFileSync(path.join(rootDir, 'leituras.html'), 'utf-8');

    // Check vocabulary and hints in stories
    assert.ok(leiturasJs.includes('vocabulary:'), 'leituras.js must include vocabulary for stories');
    assert.ok(leiturasJs.includes('hint:'), 'leituras.js must include comprehension hint');

    const storyMatches = leiturasJs.match(/title:\s*['"]/g);
    assert.ok(storyMatches && storyMatches.length >= 8, 'leituras.js should have at least 8 stories');

    // Check reading aids in HTML/JS
    assert.ok(leiturasJs.includes('storyHintBox'), 'leituras.js must have storyHintBox aid');
    assert.ok(leiturasJs.includes('btnGuidedReading'), 'leituras.js must have guided reading');
    assert.ok(leiturasHtml.includes('vocab-chips') || leiturasJs.includes('vocab-chips'), 'leituras must have vocabulary helper chips');
});

test('Escrita module uses canvas handwriting (not keyboard), includes toggle for background word guide and notebook paper callout', () => {
    const escritaJs = fs.readFileSync(path.join(rootDir, 'escrita.js'), 'utf-8');
    const escritaHtml = fs.readFileSync(path.join(rootDir, 'escrita.html'), 'utf-8');

    // Canvas handwriting
    assert.ok(escritaHtml.includes('id="writingCanvas"'), 'escrita.html must have writingCanvas');
    assert.ok(escritaHtml.includes('letter-paths.js'), 'escrita.html must load letter-paths.js');
    assert.ok(!escritaHtml.includes('id="virtualKeyboard"'), 'escrita.html must not have virtualKeyboard');
    assert.ok(!escritaJs.includes('function renderVirtualKeyboard'), 'escrita.js must not render virtual keyboard');

    // Toggle button for background word guide
    assert.ok(escritaHtml.includes('id="btnToggleWordGuide"'), 'escrita.html must have visible toggle button for word guide');
    assert.ok(escritaJs.includes('function toggleWordGuide()'), 'escrita.js must implement toggleWordGuide');
    assert.ok(escritaJs.includes('hideWordGuide'), 'escrita.js must support hideWordGuide state');

    // Notebook paper prompt and audio tip
    assert.ok(escritaHtml.includes('notebook-callout-card'), 'escrita.html must display prominent notebook paper callout card');
    assert.ok(escritaHtml.includes('speakNotebookTip()'), 'escrita.html must have button to speak notebook tip');
    assert.ok(escritaJs.includes('function speakNotebookTip()'), 'escrita.js must implement speakNotebookTip');
});
