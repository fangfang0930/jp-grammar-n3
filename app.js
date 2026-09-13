(function () {
    'use strict';

    const state = {
        currentIndex: -1,
        filteredData: [],
        voices: [],
        japaneseVoice: null,
        chineseVoice: null,
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
            }
            const zh = state.voices.filter(v => /zh|CN|TW|HK|Chinese|普通话|中文|国语|Tingting|Sinji|Meijia/i.test(v.lang + v.name));
            if (zh.length > 0) {
                state.chineseVoice = zh.find(v => /Tingting|Sinji|Meijia|Xiaoxiao|Yaoyao/i.test(v.name)) || zh[0];
            }
        }

        pickVoice();
        speechSynthesis.onvoiceschanged = pickVoice;
    }

    function detectLang(text) {
        if (!text) return 'zh';
        let zhCount = 0;
        let jaCount = 0;
        const cleaned = text.replace(/\s+/g, '');
        if (!cleaned) return 'zh';
        for (const ch of cleaned) {
            const c = ch.codePointAt(0);
            if (!c) continue;
            if ((c >= 0x4E00 && c <= 0x9FFF) || (c >= 0x3400 && c <= 0x4DBF)) zhCount++;
            if ((c >= 0x3040 && c <= 0x309F) || (c >= 0x30A0 && c <= 0x30FF) || (c >= 0x31F0 && c <= 0x31FF) || (c >= 0xFF66 && c <= 0xFF9F) || (c >= 0x3000 && c <= 0x303F)) jaCount++;
        }
        if (jaCount === 0 && zhCount === 0) {
            return /[A-Za-z]/.test(cleaned) ? 'en' : 'zh';
        }
        return jaCount >= zhCount ? 'ja' : 'zh';
    }

    function splitByLang(text) {
        if (!text) return [];
        const tokens = [];
        let buffer = '';
        let currentLang = null;
        for (const ch of text) {
            const c = ch.codePointAt(0);
            let lang = 'neutral';
            if (c != null) {
                const isJa = (c >= 0x3040 && c <= 0x309F) || (c >= 0x30A0 && c <= 0x30FF) || (c >= 0x31F0 && c <= 0x31FF) || (c >= 0xFF66 && c <= 0xFF9F) || (c >= 0x3000 && c <= 0x303F);
                const isZh = (c >= 0x4E00 && c <= 0x9FFF) || (c >= 0x3400 && c <= 0x4DBF);
                const isPunctOrLatin = c < 0x3000 || (c >= 0xFF00 && c <= 0xFFEF && !isJa) || /[・「」『』（）、。！？：；…—]/.test(ch);
                if (isJa) lang = 'ja';
                else if (isZh) lang = 'zh';
                else if (isPunctOrLatin) lang = 'punct';
            }
            if (currentLang === null) {
                currentLang = (lang === 'punct' || lang === 'neutral') ? 'zh' : lang;
            }
            if (lang === 'punct' || lang === 'neutral') {
                buffer += ch;
            } else if (lang === currentLang) {
                buffer += ch;
            } else {
                    if (buffer.trim()) tokens.push({ lang: currentLang, text: buffer });
                    buffer = ch;
                    currentLang = lang;
            }
        }
        if (buffer && buffer.trim()) tokens.push({ lang: currentLang || 'zh', text: buffer });
        return mergeShortTokens(tokens);
    }

    function mergeShortTokens(tokens) {
        if (tokens.length <= 1) return tokens;
        const merged = [];
        for (const t of tokens) {
            const last = merged[merged.length - 1];
            if (last && t.text.replace(/\s/g, '').length <= 2 && t.text.trim()) {
                last.text += t.text;
            } else if (last && last.lang === t.lang) {
                last.text += t.text;
            } else {
                merged.push({ lang: t.lang, text: t.text });
            }
        }
        return merged.filter(t => t && t.text && t.text.trim());
    }

    function getVoiceAndLang(lang) {
        if (lang === 'ja') {
            return { voice: state.japaneseVoice, langCode: 'ja-JP', rate: 0.95 };
        }
        return { voice: state.chineseVoice, langCode: 'zh-CN', rate: 1.0 };
    }

    function clearSpeakingFlags() {
        document.querySelectorAll('.speak-btn, .speak-inline-btn, .speak-example-btn')
            .forEach(b => b.classList.remove('speaking'));
    }

    function speakSegments(segments, btnEl, onAllDone) {
        if (!segments || segments.length === 0) {
            if (typeof onAllDone === 'function') onAllDone();
            return;
        }
        if (!('speechSynthesis' in window)) {
            showToast('浏览器不支持语音朗读');
            return;
        }
        speechSynthesis.cancel();

        clearSpeakingFlags();
        if (btnEl) btnEl.classList.add('speaking');
        els.stopBtn.hidden = false;
        state.isSpeaking = true;

        let idx = 0;
        function speakNext() {
            if (idx >= segments.length || !state.isSpeaking) {
                if (btnEl) btnEl.classList.remove('speaking');
                els.stopBtn.hidden = true;
                state.isSpeaking = false;
                if (typeof onAllDone === 'function') onAllDone();
                return;
            }
            const seg = segments[idx];
            if (!seg.text || !seg.text.trim()) {
                idx++;
                speakNext();
                return;
            }
            const cfg = getVoiceAndLang(seg.lang);
            const utter = new SpeechSynthesisUtterance(seg.text);
            utter.lang = cfg.langCode;
            utter.rate = cfg.rate;
            utter.pitch = 1;
            if (cfg.voice) utter.voice = cfg.voice;
            utter.onend = () => { idx++; speakNext(); };
            utter.onerror = () => { idx++; speakNext(); };
            speechSynthesis.speak(utter);
        }
        speakNext();
    }

    function speakAuto(text, btnEl) {
        if (!text || !text.trim()) return;
        const parts = splitByLang(text);
        speakSegments(parts, btnEl);
    }

    function speakByHint(text, preferLang, btnEl) {
        if (!text || !text.trim()) return;
        const detected = detectLang(text);
        const lang = preferLang || detected;
        const segments = [{ lang: lang, text: text }];
        speakSegments(segments, btnEl);
    }

    function stopSpeak() {
        state.isSpeaking = false;
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        clearSpeakingFlags();
        els.stopBtn.hidden = true;
    }

    function buildAllSegments(item) {
        const parts = [];
        if (item.title) {
            parts.push({ lang: 'ja', text: item.title });
        }
        if (item.connection) {
            const txt = '接续：' + item.connection;
            parts.push(...splitByLang(txt));
        }
        if (item.meaning) {
            const txt = '意思：' + item.meaning;
            parts.push(...splitByLang(txt));
        }
        if (item.examples && item.examples.length) {
            item.examples.forEach((ex, i) => {
                if (ex.jp) parts.push({ lang: 'ja', text: ex.jp });
                if (ex.cn) parts.push(...splitByLang(ex.cn));
            });
        }
        if (item.note) {
            const txt = '说明：' + item.note;
            parts.push(...splitByLang(txt));
        }
        return parts;
    }

    function speakAll(item) {
        const segs = buildAllSegments(item);
        if (!segs.length) return;
        speakSegments(segs, els.speakAllBtn);
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
            item.examples.forEach((ex) => {
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
                        speakByHint(ex.jp, 'ja', sbtn);
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
            if (item && item.title) speakByHint(item.title, 'ja', els.speakTitleBtn);
        });

        document.querySelectorAll('.speak-inline-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const target = document.getElementById(targetId);
                if (target) speakAuto(target.textContent, btn);
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
