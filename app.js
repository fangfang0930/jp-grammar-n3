(function () {
    'use strict';

    const STORAGE_KEY = 'jp-pdf-reader-read-ids';
    const SHOW_CN_KEY = 'jp-pdf-reader-show-cn';

    const state = {
        currentIndex: -1,
        filteredData: [],
        voices: [],
        japaneseVoice: null,
        chineseVoice: null,
        isSpeaking: false,
        showCn: false,
        readIds: new Set()
    };

    const els = {
        listView: document.getElementById('list-view'),
        detailView: document.getElementById('detail-view'),
        listToolbar: document.getElementById('list-toolbar'),
        grammarList: document.getElementById('grammar-list'),
        emptyHint: document.getElementById('empty-hint'),
        searchInput: document.getElementById('search-input'),
        backBtn: document.getElementById('back-btn'),
        pageTitle: document.getElementById('page-title'),
        countInfo: document.getElementById('count-info'),
        progressInfo: document.getElementById('progress-info'),
        detailMeta: document.getElementById('detail-meta'),
        detailTitle: document.getElementById('detail-title'),
        detailMeaning: document.getElementById('detail-meaning'),
        detailExamples: document.getElementById('detail-examples'),
        detailNote: document.getElementById('detail-note'),
        noteSection: document.getElementById('note-section'),
        speakTitleBtn: document.getElementById('speak-title-btn'),
        speakAllBtn: document.getElementById('speak-all-btn'),
        stopBtn: document.getElementById('stop-btn'),
        markReadBtn: document.getElementById('mark-read-btn'),
        toggleCnGlobal: document.getElementById('toggle-cn-global'),
        toggleCnDetail: document.getElementById('toggle-cn-detail'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        toast: document.getElementById('toast')
    };

    function showToast(msg, duration = 2000) {
        els.toast.textContent = msg;
        els.toast.hidden = false;
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => { els.toast.hidden = true; }, duration);
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function highlightText(text, keyword) {
        const safe = escapeHtml(text);
        if (!keyword) return safe;
        const kw = keyword.trim();
        if (!kw) return safe;
        const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        return safe.replace(regex, m => `<span class="highlight">${m}</span>`);
    }

    function loadReadIds() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            state.readIds = new Set(Array.isArray(arr) ? arr.map(String) : []);
        } catch (_) {
            state.readIds = new Set();
        }
    }

    function saveReadIds() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.readIds]));
        } catch (_) { /* ignore */ }
    }

    function itemId(item) {
        return String(item._idx);
    }

    function isRead(item) {
        return state.readIds.has(itemId(item));
    }

    function toggleRead(item) {
        const id = itemId(item);
        if (state.readIds.has(id)) state.readIds.delete(id);
        else state.readIds.add(id);
        saveReadIds();
        updateProgress();
        updateMarkReadBtn(item);
    }

    function data() {
        return window.GRAMMAR_DATA || [];
    }

    function updateProgress() {
        els.progressInfo.textContent = `已读 ${state.readIds.size} / ${data().length}`;
    }

    function setShowCn(show) {
        state.showCn = !!show;
        document.body.classList.toggle('show-cn', state.showCn);
        const label = state.showCn ? '隐藏中文' : '显示中文';
        [els.toggleCnGlobal, els.toggleCnDetail].forEach(btn => {
            if (!btn) return;
            btn.textContent = label;
            btn.setAttribute('aria-pressed', state.showCn ? 'true' : 'false');
        });
        document.querySelectorAll('.example-cn, .cn-line').forEach(el => {
            el.classList.toggle('is-hidden', !state.showCn);
        });
        document.querySelectorAll('.cn-placeholder').forEach(el => {
            el.classList.toggle('is-hidden', state.showCn);
        });
        try {
            localStorage.setItem(SHOW_CN_KEY, state.showCn ? '1' : '0');
        } catch (_) { /* ignore */ }
    }

    function initShowCn() {
        let show = false;
        try {
            show = localStorage.getItem(SHOW_CN_KEY) === '1';
        } catch (_) { /* ignore */ }
        setShowCn(show);
    }

    function prepareJapaneseText(text) {
        return String(text || '')
            .replace(/\u3000/g, ' ')
            .replace(/[～〜]/g, 'ー')
            .replace(/…+/g, '。')
            .replace(/・/g, '、')
            .replace(/[「」『』【】〔〕]/g, ' ')
            .replace(/[（(]/g, '、')
            .replace(/[）)]/g, '。')
            .replace(/[/／]/g, '、')
            .replace(/\s*\n+\s*/g, '。')
            .replace(/\s{2,}/g, ' ')
            .replace(/([。！？])\1+/g, '$1')
            .replace(/\s+([。、！？])/g, '$1')
            .trim();
    }

    function chunkJapaneseSpeech(text, maxLen = 90) {
        const prepared = prepareJapaneseText(text);
        if (!prepared) return [];
        if (prepared.length <= maxLen) return [prepared];
        const parts = prepared.split(/(?<=[。！？、])/);
        const chunks = [];
        let buf = '';
        for (const part of parts) {
            if ((buf + part).length > maxLen && buf) {
                chunks.push(buf.trim());
                buf = part;
            } else {
                buf += part;
            }
        }
        if (buf.trim()) chunks.push(buf.trim());
        return chunks.length ? chunks : [prepared];
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
                state.japaneseVoice =
                    ja.find(v => /Google|Neural|Premium|Enhanced|Kyoko|Otoya|Nanami|Haruka/i.test(v.name)) ||
                    ja[0];
            }
            const zh = state.voices.filter(v =>
                /zh|CN|TW|HK|Chinese|普通话|中文|国语|Tingting|Sinji|Meijia/i.test(v.lang + v.name)
            );
            if (zh.length > 0) {
                state.chineseVoice =
                    zh.find(v => /Tingting|Sinji|Meijia|Xiaoxiao|Yaoyao|Google/i.test(v.name)) ||
                    zh[0];
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
            if (
                (c >= 0x3040 && c <= 0x309F) ||
                (c >= 0x30A0 && c <= 0x30FF) ||
                (c >= 0x31F0 && c <= 0x31FF) ||
                (c >= 0xFF66 && c <= 0xFF9F) ||
                (c >= 0x3000 && c <= 0x303F)
            ) jaCount++;
        }
        if (jaCount === 0 && zhCount === 0) {
            return /[A-Za-z]/.test(cleaned) ? 'en' : 'zh';
        }
        if (jaCount > 0) return 'ja';
        return 'zh';
    }

    function getVoiceAndLang(lang) {
        if (lang === 'ja') {
            return { voice: state.japaneseVoice, langCode: 'ja-JP', rate: 0.95 };
        }
        return { voice: state.chineseVoice, langCode: 'zh-CN', rate: 1.0 };
    }

    function clearSpeakingFlags() {
        document.querySelectorAll('.speak-btn, .speak-example-btn, .primary-btn')
            .forEach(b => b.classList.remove('speaking'));
    }

    function speakSegments(segments, btnEl) {
        if (!segments || !segments.length) return;
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

        // Chrome sometimes pauses mid-queue; keep the synth warm.
        if (speakSegments._keepAlive) clearInterval(speakSegments._keepAlive);
        speakSegments._keepAlive = setInterval(() => {
            if (!state.isSpeaking) {
                clearInterval(speakSegments._keepAlive);
                return;
            }
            if (speechSynthesis.paused) speechSynthesis.resume();
        }, 4000);
    }

    function speakJapanese(text, btnEl) {
        if (!text || !text.trim()) return;
        const chunks = chunkJapaneseSpeech(text);
        speakSegments(chunks.map(t => ({ lang: 'ja', text: t })), btnEl);
    }

    function stopSpeak() {
        state.isSpeaking = false;
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        if (speakSegments._keepAlive) clearInterval(speakSegments._keepAlive);
        clearSpeakingFlags();
        els.stopBtn.hidden = true;
    }

    function filterData(keyword) {
        const kw = (keyword || '').trim().toLowerCase();
        const all = data();
        if (!kw) {
            state.filteredData = all.slice();
            return;
        }
        state.filteredData = all.filter(item => {
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
            els.countInfo.textContent = `共 0 / ${data().length} 条`;
            return;
        }
        els.emptyHint.hidden = true;

        const frag = document.createDocumentFragment();
        state.filteredData.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'grammar-item' + (isRead(item) ? ' is-read' : '');
            li.dataset.index = String(item._idx);

            const idx = document.createElement('div');
            idx.className = 'item-index';
            idx.textContent = String(item._idx + 1).padStart(3, '0');

            const content = document.createElement('div');
            content.className = 'item-content';

            const title = document.createElement('div');
            title.className = 'item-title';
            title.innerHTML = highlightText(item.title || '(无标题)', kw);

            const firstEx = (item.examples && item.examples[0]) || {};
            const previewJp = document.createElement('div');
            previewJp.className = 'item-preview item-preview-jp';
            previewJp.innerHTML = highlightText(firstEx.jp || item.meaning || '', kw);

            const previewCn = document.createElement('div');
            previewCn.className = 'item-preview item-preview-cn';
            previewCn.innerHTML = highlightText(firstEx.cn || item.meaning || '', kw);

            content.appendChild(title);
            content.appendChild(previewJp);
            content.appendChild(previewCn);

            if (isRead(item)) {
                const dot = document.createElement('div');
                dot.className = 'read-dot';
                dot.title = '已读';
                li.appendChild(idx);
                li.appendChild(content);
                li.appendChild(dot);
            } else {
                const arrow = document.createElement('div');
                arrow.className = 'item-arrow';
                arrow.textContent = '›';
                li.appendChild(idx);
                li.appendChild(content);
                li.appendChild(arrow);
            }

            li.addEventListener('click', () => showDetail(item._idx));
            frag.appendChild(li);
        });

        els.grammarList.appendChild(frag);
        els.countInfo.textContent = `共 ${state.filteredData.length} / ${data().length} 条`;
        updateProgress();
    }

    function updateMarkReadBtn(item) {
        const read = isRead(item);
        els.markReadBtn.textContent = read ? '标为未读' : '标为已读';
        els.markReadBtn.classList.toggle('is-active', read);
    }

    function updateNav(idx) {
        const posInFilter = state.filteredData.findIndex(x => x._idx === idx);
        const prev = posInFilter > 0 ? state.filteredData[posInFilter - 1] : null;
        const next = posInFilter >= 0 && posInFilter < state.filteredData.length - 1
            ? state.filteredData[posInFilter + 1]
            : null;

        els.prevBtn.hidden = !prev;
        els.nextBtn.hidden = !next;
        els.prevBtn.disabled = !prev;
        els.nextBtn.disabled = !next;
        els.prevBtn.dataset.target = prev ? String(prev._idx) : '';
        els.nextBtn.dataset.target = next ? String(next._idx) : '';
        els.prevBtn.textContent = prev ? `← ${prev.title}` : '← 上一条';
        els.nextBtn.textContent = next ? `${next.title} →` : '下一条 →';
    }

    function showDetail(idx) {
        const item = data()[idx];
        if (!item) return;
        state.currentIndex = idx;
        stopSpeak();

        els.detailMeta.textContent = `${String(idx + 1).padStart(3, '0')} / ${data().length}`;
        els.detailTitle.textContent = item.title || '(无标题)';
        els.detailMeaning.textContent = item.meaning || item.connection || '—';
        els.detailNote.textContent = item.note || '';
        els.noteSection.hidden = !item.note;

        els.detailExamples.innerHTML = '';
        const examples = (item.examples || []).filter(ex => ex && (ex.jp || ex.cn));
        if (examples.length) {
            examples.forEach((ex) => {
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
                    sbtn.title = '朗读日文';
                    sbtn.textContent = '🔊';
                    sbtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        speakJapanese(ex.jp, sbtn);
                    });
                    wrap.appendChild(sbtn);
                }

                const placeholder = document.createElement('div');
                placeholder.className = 'cn-placeholder' + (state.showCn ? ' is-hidden' : '');
                placeholder.textContent = '中文已隐藏，先自己读一遍';
                wrap.appendChild(placeholder);

                if (ex.cn) {
                    const p2 = document.createElement('div');
                    p2.className = 'example-cn' + (state.showCn ? '' : ' is-hidden');
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

        updateMarkReadBtn(item);
        updateNav(idx);

        els.listView.hidden = true;
        els.listToolbar.hidden = true;
        els.detailView.hidden = false;
        els.backBtn.hidden = false;
        els.pageTitle.textContent = '阅读练习';
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    function hideDetail() {
        stopSpeak();
        state.currentIndex = -1;
        els.detailView.hidden = true;
        els.listView.hidden = false;
        els.listToolbar.hidden = false;
        els.backBtn.hidden = true;
        els.pageTitle.textContent = '日语 PDF 阅读';
        renderList();
    }

    function speakCurrentJapanese() {
        const item = data()[state.currentIndex];
        if (!item) return;
        const parts = [];
        if (item.title) parts.push(item.title);
        (item.examples || []).forEach(ex => {
            if (ex && ex.jp) parts.push(ex.jp);
        });
        if (!parts.length) {
            showToast('没有可朗读的日文');
            return;
        }
        const segments = parts.flatMap(t =>
            chunkJapaneseSpeech(t).map(chunk => ({ lang: 'ja', text: chunk }))
        );
        speakSegments(segments, els.speakAllBtn);
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

        els.toggleCnGlobal.addEventListener('click', () => setShowCn(!state.showCn));
        els.toggleCnDetail.addEventListener('click', () => setShowCn(!state.showCn));

        els.speakTitleBtn.addEventListener('click', () => {
            const item = data()[state.currentIndex];
            if (item && item.title) speakJapanese(item.title, els.speakTitleBtn);
        });

        els.speakAllBtn.addEventListener('click', speakCurrentJapanese);
        els.stopBtn.addEventListener('click', stopSpeak);

        els.markReadBtn.addEventListener('click', () => {
            const item = data()[state.currentIndex];
            if (item) toggleRead(item);
        });

        els.prevBtn.addEventListener('click', () => {
            const t = els.prevBtn.dataset.target;
            if (t !== '') showDetail(Number(t));
        });
        els.nextBtn.addEventListener('click', () => {
            const t = els.nextBtn.dataset.target;
            if (t !== '') showDetail(Number(t));
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopSpeak();
        });

        document.addEventListener('keydown', (e) => {
            if (els.detailView.hidden) return;
            if (e.key === 'ArrowLeft' && !els.prevBtn.hidden) els.prevBtn.click();
            if (e.key === 'ArrowRight' && !els.nextBtn.hidden) els.nextBtn.click();
            if (e.key === 'c' || e.key === 'C') setShowCn(!state.showCn);
        });
    }

    function prepareData() {
        const source = (typeof GRAMMAR_DATA !== 'undefined' && Array.isArray(GRAMMAR_DATA))
            ? GRAMMAR_DATA
            : [];
        const cleaned = source.filter(item => item && item.title);
        cleaned.forEach((item, i) => { item._idx = i; });
        window.GRAMMAR_DATA = cleaned;
    }

    function init() {
        prepareData();
        loadReadIds();
        initShowCn();
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
