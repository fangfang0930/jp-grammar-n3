(function () {
    'use strict';

    const state = {
        currentIndex: -1,
        filteredData: [],
        voices: [],
        japaneseVoice: null,
        isSpeaking: false
    };

    const els = {
        listView: document.getElementById('list-view'),
        detailView: document.getElementById('detail-view'),
        grammarList: document.getElementById('grammar-list'),
        emptyHint: document.getElementById('empty-hint'),
        searchInput: document.getElementById('search-input'),
        backBtn: document.getElementById('back-btn'),
        pageTitle: document.getElementById('page-title'),
        countInfo: document.getElementById('count-info'),
        detailTitle: document.getElementById('detail-title'),
        detailConnection: document.getElementById('detail-connection'),
        detailMeaning: document.getElementById('detail-meaning'),
        detailExamples: document.getElementById('detail-examples'),
        detailNote: document.getElementById('detail-note'),
        speakTitleBtn: document.getElementById('speak-title-btn'),
        speakAllBtn: document.getElementById('speak-all-btn'),
        stopBtn: document.getElementById('stop-btn'),
        toast: document.getElementById('toast')
    };

    function showToast(msg, duration = 2000) {
        els.toast.textContent = msg;
        els.toast.hidden = false;
        setTimeout(() => { els.toast.hidden = true; }, duration);
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function highlightText(text, keyword) {
        let safe = escapeHtml(text);
        if (!keyword) return safe;
        const kw = keyword.trim();
        if (!kw) return safe;
        const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        return safe.replace(regex, m => `<span class="highlight">${m}</span>`);
    }

    function initVoices() {
        if (!('speechSynthesis' in window)) {
            showToast('当前浏览器不支持语音朗读功能');
            return;
        }

        function pickVoice() {
            state.voices = speechSynthesis.getVoices();
            const ja = state.voices.filter(v => /ja|JP|日本語/i.test(v.lang) || /japan/i.test(v.name));
            if (ja.length > 0) {
                state.japaneseVoice = ja.find(v => /Kyoko|Otoya|Nanami/i.test(v.name)) || ja[0];
            } else if (state.voices.length > 0) {
                state.japaneseVoice = state.voices[0];
            }
        }

        pickVoice();
        speechSynthesis.onvoiceschanged = pickVoice;
    }

    function speakText(text, btnEl) {
        if (!text || !text.trim()) return;
        if (!('speechSynthesis' in window)) {
            showToast('浏览器不支持语音朗读');
            return;
        }

        speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'ja-JP';
        utter.rate = 0.95;
        utter.pitch = 1;
        if (state.japaneseVoice) utter.voice = state.japaneseVoice;

        const btns = document.querySelectorAll('.speak-btn, .speak-inline-btn, .speak-example-btn');
        btns.forEach(b => b.classList.remove('speaking'));

        if (btnEl) btnEl.classList.add('speaking');
        els.stopBtn.hidden = false;
        state.isSpeaking = true;

        utter.onend = () => {
            if (btnEl) btnEl.classList.remove('speaking');
            els.stopBtn.hidden = true;
            state.isSpeaking = false;
        };
        utter.onerror = () => {
            if (btnEl) btnEl.classList.remove('speaking');
            els.stopBtn.hidden = true;
            state.isSpeaking = false;
        };

        speechSynthesis.speak(utter);
    }

    function stopSpeak() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        document.querySelectorAll('.speak-btn, .speak-inline-btn, .speak-example-btn')
            .forEach(b => b.classList.remove('speaking'));
        els.stopBtn.hidden = true;
        state.isSpeaking = false;
    }

    function speakAll(item) {
        const parts = [];
        if (item.title) parts.push(item.title);
        if (item.connection) parts.push('接续：' + item.connection);
        if (item.meaning) parts.push('意思：' + item.meaning);
        if (item.examples && item.examples.length) {
            item.examples.forEach(ex => {
                if (ex.jp) parts.push(ex.jp);
                if (ex.cn) parts.push(ex.cn);
            });
        }
        if (item.note) parts.push('说明：' + item.note);

        if (!parts.length) return;

        speechSynthesis.cancel();
        els.stopBtn.hidden = false;
        state.isSpeaking = true;

        const btns = document.querySelectorAll('.speak-btn, .speak-inline-btn, .speak-example-btn');
        btns.forEach(b => b.classList.remove('speaking'));
        els.speakAllBtn.classList.add('speaking');

        let idx = 0;
        function speakNext() {
            if (idx >= parts.length) {
                els.speakAllBtn.classList.remove('speaking');
                els.stopBtn.hidden = true;
                state.isSpeaking = false;
                return;
            }
            const utter = new SpeechSynthesisUtterance(parts[idx]);
            utter.lang = 'ja-JP';
            utter.rate = 0.95;
            utter.pitch = 1;
            if (state.japaneseVoice) utter.voice = state.japaneseVoice;
            utter.onend = () => { idx++; speakNext(); };
            utter.onerror = () => { idx++; speakNext(); };
            speechSynthesis.speak(utter);
        }
        speakNext();
    }

    function filterData(keyword) {
        const kw = (keyword || '').trim().toLowerCase();
        if (!kw) {
            state.filteredData = GRAMMAR_DATA.slice();
            return;
        }
        state.filteredData = GRAMMAR_DATA.filter(item => {
            const hay = [
                item.title,
                item.connection,
                item.meaning,
                item.note,
                ...(item.examples || []).flatMap(e => [e.jp, e.cn])
            ].filter(Boolean).join(' ').toLowerCase();
            return hay.includes(kw);
        });
    }

    function renderList() {
        const kw = els.searchInput.value;
        els.grammarList.innerHTML = '';

        if (!state.filteredData.length) {
            els.emptyHint.hidden = false;
            els.countInfo.textContent = `共 0 / ${GRAMMAR_DATA.length} 条`;
            return;
        }
        els.emptyHint.hidden = true;

        const frag = document.createDocumentFragment();
        state.filteredData.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'grammar-item';
            li.dataset.index = String(item._idx);

            const idx = document.createElement('div');
            idx.className = 'item-index';
            idx.textContent = String(item._idx + 1).padStart(3, '0');

            const content = document.createElement('div');
            content.className = 'item-content';

            const title = document.createElement('div');
            title.className = 'item-title';
            title.innerHTML = highlightText(item.title || '(无标题)', kw);

            const meaning = document.createElement('div');
            meaning.className = 'item-meaning';
            meaning.innerHTML = highlightText(item.meaning || '(无释义)', kw);

            content.appendChild(title);
            content.appendChild(meaning);

            const arrow = document.createElement('div');
            arrow.className = 'item-arrow';
            arrow.textContent = '›';

            li.appendChild(idx);
            li.appendChild(content);
            li.appendChild(arrow);

            li.addEventListener('click', () => showDetail(item._idx));
            frag.appendChild(li);
        });

        els.grammarList.appendChild(frag);
        els.countInfo.textContent = `共 ${state.filteredData.length} / ${GRAMMAR_DATA.length} 条`;
    }

    function showDetail(idx) {
        const item = GRAMMAR_DATA[idx];
        if (!item) return;
        state.currentIndex = idx;
        stopSpeak();

        els.detailTitle.textContent = item.title || '(无标题)';
        els.detailConnection.textContent = item.connection || '—';
        els.detailMeaning.textContent = item.meaning || '—';
        els.detailNote.textContent = item.note || '—';

        els.detailExamples.innerHTML = '';
        if (item.examples && item.examples.length) {
            item.examples.forEach((ex, i) => {
                if (!ex.jp && !ex.cn) return;
                const wrap = document.createElement('div');
                wrap.className = 'example-item';

                if (ex.jp) {
                    const p = document.createElement('div');
                    p.className = 'example-jp';
                    p.textContent = ex.jp;
                    wrap.appendChild(p);

                    const sbtn = document.createElement('button');
                    sbtn.className = 'speak-example-btn';
                    sbtn.type = 'button';
                    sbtn.title = '朗读例句';
                    sbtn.textContent = '🔊';
                    sbtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        speakText(ex.jp, sbtn);
                    });
                    wrap.appendChild(sbtn);
                }
                if (ex.cn) {
                    const p2 = document.createElement('div');
                    p2.className = 'example-cn';
                    p2.textContent = ex.cn;
                    wrap.appendChild(p2);
                }
                els.detailExamples.appendChild(wrap);
            });
        } else {
            const p = document.createElement('p');
            p.style.color = 'var(--text-secondary)';
            p.style.fontSize = '14px';
            p.textContent = '暂无例句';
            els.detailExamples.appendChild(p);
        }

        els.listView.hidden = true;
        els.detailView.hidden = false;
        els.backBtn.hidden = false;
        els.pageTitle.textContent = '语法详情';
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    }

    function hideDetail() {
        stopSpeak();
        state.currentIndex = -1;
        els.detailView.hidden = true;
        els.listView.hidden = false;
        els.backBtn.hidden = true;
        els.pageTitle.textContent = 'N3句型语法 123条';
    }

    function bindEvents() {
        let searchTimer = null;
        els.searchInput.addEventListener('input', (e) => {
            const val = e.target.value;
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                filterData(val);
                renderList();
            }, 120);
        });

        els.backBtn.addEventListener('click', hideDetail);

        els.speakTitleBtn.addEventListener('click', () => {
            const item = GRAMMAR_DATA[state.currentIndex];
            if (item && item.title) speakText(item.title, els.speakTitleBtn);
        });

        document.querySelectorAll('.speak-inline-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const target = document.getElementById(targetId);
                if (target) speakText(target.textContent, btn);
            });
        });

        els.speakAllBtn.addEventListener('click', () => {
            const item = GRAMMAR_DATA[state.currentIndex];
            if (item) speakAll(item);
        });

        els.stopBtn.addEventListener('click', stopSpeak);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopSpeak();
        });
    }

    function prepareData() {
        if (typeof GRAMMAR_DATA === 'undefined' || !Array.isArray(GRAMMAR_DATA)) {
            window.GRAMMAR_DATA = [];
        }
        GRAMMAR_DATA.forEach((item, i) => { item._idx = i; });
    }

    function init() {
        prepareData();
        filterData('');
        renderList();
        bindEvents();
        initVoices();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
