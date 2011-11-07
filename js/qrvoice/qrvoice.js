/* Copyright (c) 2011, Marcel Duran */

/*global YUI*/
YUI.add('qrvoice', function (Y) {
    'use strict';
    var
        // uninitialized variables
        ratio, idx, search, params, placeholder, intl, currentSize, intls,
        listStr, currentLang, lastMsg, lastLang,
        sliderWidth, initialSize, img,

        // const
        APPID = 'qrvoice',
        BITLY_LOGIN = APPID,
        BITLY_APIKEY = 'R_039525bc02a0dbe1e6456752fdc17997',
        BITLY_DOMAIN = 'http://my.qrvoice.net/',
        URL_SHORTEN = 'http://api.bitly.com/v3/shorten?login=' + BITLY_LOGIN + '&apiKey=' + BITLY_APIKEY + '&longUrl={url}&format=json&callback={callback}',
        URL_VOICE = 'http://translate.google.com/translate_tts?ie=UTF-8&q={msg}&tl={lang}',
        URL_QRCODE = 'http://chart.apis.google.com/chart?cht=qr&choe=UTF-8&chs={size}x{size}&chl={url}',
        URL_FACEBOOK = 'http://www.facebook.com/sharer.php?t=QR%20voice&u=http%253A%252F%252Fqrvoice.net%2F%3Fid%3D{id}',
        URL_TWITTER = 'http://twitter.com/share?source=tweetbutton&text=QR%20voice&url=http%3A%2F%2Fqrvoice.net%2F%3Fid%3D{id}',
        SIZE_MIN = 33,
        SIZE_MAX = 547,
        LANG_ROWS = 10,
        CLASS_HIDDEN = 'hidden',
        CLASS_SELECT = 'lng-sel',
        CLASS_INVISIBLE = 'invis',
        SEL_LBL = '.lbl',
        SEL_BODY = 'body',
        SEL_LINK = '#qrlink',
        SEL_COPY = '#qrcopy',

        // minifier helpers
        YONE = Y.one,
        YINTL = Y.Intl,
        INTL = YINTL.get(APPID),
        YLANG = Y.Lang,
        SUBS = YLANG.sub,
        WIN = Y.config.win,
        LOC = WIN.location,
        NAV = WIN.navigator,
        STORAGE = Y.StorageLite,
        STORAGEGET = STORAGE.getItem,
        STORAGESET = STORAGE.setItem,
        YNODE = Y.Node,
        YNODECREATE = YNODE.create,
        YOBJEACH = Y.Object.each,
        DOMNODE = YNODE.getDOMNode,
        ENCODE = encodeURIComponent,
        ROUND = Math.round,
        NULL = null,
        VALUE = 'value',
        LANG = 'lang',
        PLACEHOLDER = 'placeholder',
        TITLE = 'title',
        CLICK = 'click',
        SIZE = 'size',
        RTL = 'rtl',
        ID = 'id',
        HREF = 'href',

        // initialized variables
        reId = /[\d\w\-_]/g,
        langs = INTL.langs,
        language = NAV.userLanguage || NAV.language,
        languageShort = language.slice(0, 2).toLowerCase(),
        langCount = 0,

        // nodes
        body = YONE(SEL_BODY),
        form = body.one('#form'),
        msg = form.one('#msg'),
        size = body.one('#size'),
        thumb = body.one('#slider-thumb'),
        qrimg = body.one('#qrcode-wrp'),
        link = body.one(SEL_LINK),
        copy = body.one(SEL_COPY),
        copyNode = DOMNODE(copy),
        sliderBox = body.one('#slider-box'),
        langList = form.one('#lang-lst'),
        langLink = form.one('#lang'),
        langName = form.one('#lang-name'),
        fbLink = body.one('#social .facebook'),
        twLink = body.one('#social .twitter'),

        // size slider
        slider = new Y.apm.SimpleSlider({
            node: sliderBox
        }).render(),

        /**
         * Set location using either pushState when available or
         * hash as a fallback.
         */
        setLocation = (function () {
            var hist = WIN.history;

            return (hist && hist.replaceState) ?
                    function (params) {
                        hist.replaceState(NULL, NULL,
                            params ? '?' + params : '/');
                    } :
                    function (params) {
                        LOC.hash = params;
                    };
        }()),

        /**
         * Set placeholder on top of input box on browsers that
         * does not support html5 placeholder attribute.
         * @param {Event} e Event from focus|blur input event, not used.
         * @param {Array} xy The x and y array positions to place over.
         */
        setPlaceholder = function (e, xy) {
            if (!msg.get(VALUE)) {
                placeholder.setXY(xy || msg.getXY());
            }
            if (e) {
                e.halt();
            }
        },

        /**
         * Get the appropriate language code, checking for simplified
         * Chinese edge case, the only one length > 2. currentLang must
         * be set prior to call this function.
         * @return {String} The appropriate language code.
         */
        getLang = function () {
            return currentLang === 'zh' ? 'zh-CN' : currentLang;
        },

        /**
         * Set language to speak the message. It also treats simplified
         * Chinese edge case and persist user's choice.
         * @param {String} lang The chosen language.
         */
        setLang = function (lang) {
            if (!langs.hasOwnProperty(lang)) {
                lang = 'en';
            }
            currentLang = lang;
            msg.set(LANG, getLang());
            langName.setContent(SUBS(INTL.whichLang, {lang: langs[lang]}));
            STORAGESET(LANG, lang);
        },

        /**
         * Callback from shorten the final qr-code url from Google Charts
         * API. It sets the image src, share link, social links  and set
         * location for bookmarking.
         * @param {Object} resp The response form bit.ly shorten,
         *        only data.url is used.
         * @param {Boolean} init When initializing jsut set src and link,
         *        not location. 
         */
        shortenQRCode = function (resp, init) {
            var url, hash,
                data = resp && resp.data;

            if (!data) {
                return;
            }
            url = data.url;
            hash = data.hash;
            // create image once
            if (!img) {
                img = YNODECREATE(
                    SUBS('<img id="qrcode" alt="{alt}">', {
                        alt: INTL.imgTitle
                    })
                );
                qrimg.append(img);
            }
            img.set('src', url);
            link.set(HREF, url).setContent(url);
            fbLink.set(HREF, SUBS(URL_FACEBOOK, {id: hash}));
            twLink.set(HREF, SUBS(URL_TWITTER, {id: hash}));
            if (!init) {
                setLocation('id=' + hash);
            }
        },

        /**
         * Callback from shorten Google translator voice url.
         * If succeded invokes shorten qr-code url.
         * @param {Object} resp The response from bit.ly shorten,
         *        only data.url is used.
         */
        shortenVoice = function (resp) {
            var qrcodeUrl, shortenUrl,
                data = resp && resp.data;

            if (!data) {
                return;
            }
            qrcodeUrl = SUBS(URL_QRCODE, {
                size: currentSize,
                url: ENCODE(data.url)
            });
            shortenUrl = SUBS(URL_SHORTEN, {url: ENCODE(qrcodeUrl)});
            Y.jsonp(shortenUrl, {
                on: {
                    success: shortenQRCode
                }
            });
        },

        /**
         * Submit message to be qr-voiced. Actually it just build Google
         * trasnlator voice url and send it to bit.ly shorten API.
         * @param {Event} e The submit form event.
         */
        submitForm = function (e) {
            var voiceUrl, shortenUrl,
                message = msg.get(VALUE),
                lang = getLang();

            e.halt();
            if (message && (lastMsg !== message || lastLang !== lang)) {
                lastMsg = message;
                lastLang = lang;
                message = ENCODE(message);
                voiceUrl = SUBS(URL_VOICE, {
                    msg: message,
                    lang: lang
                });
                shortenUrl = SUBS(URL_SHORTEN, {url: ENCODE(voiceUrl)});
                Y.jsonp(shortenUrl, {
                    on: {
                        success: shortenVoice
                    }
                });
            }
        };

    /**
     * Event listeners, mainly delegation on body.
     */

    /**
     * Form submit event from either click button or hit ENTER.
     */
    form.on('submit', submitForm);

    /**
     * Capture clicks around to hide language list when visible.
     */
    body.delegate(CLICK, function (e) {
        e.halt();
        langList.toggleClass(CLASS_HIDDEN);
    }, '#lang');

    /**
     * Show/hide language list.
     */
    body.delegate(CLICK, function (e) {
        var comp = function (node) {
            return node === langLink;
        };

        if (!e.target.ancestor(comp)) {
            langList.addClass(CLASS_HIDDEN);
        }
    }, SEL_BODY);

    /**
     * Select language from language list.
     */
    body.delegate(CLICK, function (e) {
        var node = e.target;

        e.preventDefault();
        YONE('#lng-'  + currentLang).removeClass(CLASS_SELECT);
        node.addClass(CLASS_SELECT);
        setLang(node.get(ID).slice(4));
    }, '.lng');

    /**
     * Make qr-code image link easy to copy by
     * replacing it by a selected input text box.
     */
    body.delegate('mouseover', function () {
        link.addClass(CLASS_INVISIBLE);
        copy.removeClass(CLASS_INVISIBLE)
            .set(VALUE, link.getContent());
        copyNode.focus();
        copyNode.select();
    }, SEL_LINK);
    body.delegate('mouseout', function () {
        link.removeClass(CLASS_INVISIBLE);
        copy.addClass(CLASS_INVISIBLE);
    }, SEL_COPY);

    /**
     * Resize qr-code image when slider is changed. Updade image
     * dimensions label and persist last size selection.
     * Size is validated and adjusted when necessary.
     */
    slider.on('valueChange', function (e) {
        var value = initialSize || ROUND(e.newVal[0] * ratio) + SIZE_MIN;

        initialSize = 0;
        value = value < SIZE_MIN ? SIZE_MIN :
                value > SIZE_MAX ? SIZE_MAX : value;
        currentSize = value;
        STORAGESET(SIZE, value);
        size.setContent(value + 'x' + value);
        qrimg.setStyles({
            height: value,
            width: value
        });
    });

    /**
     * Check initial parameters from location (querystring and hash) looking
     * for and ID to be used and display the qr-code image previously generated.
     */
    search = LOC.search;
    idx = search.lastIndexOf('/');
    idx = idx > -1 ? idx : search.length;
    params = search.slice(1, idx).split('&').concat(
        LOC.hash.slice(1).split('&')
    );
    Y.Array.some(params, function (p) {
        var param = p.split('='),
            value = param[1];

        if (param[0] === ID && reId.test(value)) {
            shortenQRCode({
                data: {
                    url: BITLY_DOMAIN + value,
                    hash: value
                }
            }, 1);

            return 1;
        }
    });

    /**
     * i18n, set titles, labels, content and page direction when not LTR.
     */
    if (INTL.direction === RTL) {
        body.addClass(RTL);
    }
    YONE('#tagline').setContent(INTL.tagline);
    msg
        .set(PLACEHOLDER, INTL.placeholder)
        .set(TITLE, INTL.msgTitle);
    YONE('#lbl-msg').setContent(INTL.msgTitle);
    YONE('#gen').set(TITLE, INTL.genTitle);
    YONE('#lbl-gen').setContent(INTL.genLabel);
    thumb.set(TITLE, INTL.resizeTitle);
    link.set(TITLE, INTL.linkTitle);
    qrimg.set(TITLE, INTL.imgTitle);
    YONE('#lbl-intls').setContent(INTL.intlsTitle);
    YONE('#disclaimer').setContent(INTL.disclaimer);
    fbLink.one(SEL_LBL).setContent(INTL.facebookButton);
    twLink.one(SEL_LBL).setContent(INTL.twitterButton);

    /**
     * Placeholder workaround for browsers that does not
     * support html5 placeholder attribute.
     */
    if (YLANG.isUndefined(
            DOMNODE(YNODECREATE('<input>'))[PLACEHOLDER]
        )) {
        placeholder = YNODECREATE(
            SUBS('<label class="{cls}" for="msg">{lbl}</label>', {
                cls: PLACEHOLDER,
                lbl: INTL.placeholder
            })
        );
        form.append(placeholder);
        setPlaceholder();
        msg.on('focus', setPlaceholder, NULL, [0, -1e4]);
        msg.on('blur', setPlaceholder);
    }

    /**
     * Set intls list from available languages.
     */
    listStr = '';
    intl = YINTL.getLang(APPID);
    YOBJEACH(INTL.intls, function (value, key) {
        var ownName = value.ownName;

        listStr += SUBS('<option value="{key}"{sel}>{opt}</option>', {
            key: key,
            sel: key === intl ? ' selected' : '',
            opt: value.name + (ownName ? ' - ' + ownName : '')
        });
    });
    intls = YNODECREATE(
        SUBS('<select id="intls" title="{title}">{opts}</select>', {
            title: INTL.intlsTitle,
            opts: listStr
        })
    );
    body.one('#intls-wrp').append(intls);

    /**
     * Set user interface language, persisting it and
     * reloading the page to the new language take effect.
     */
    intls.on('change', function () {
        var selIntl = intls.get('options').item(intls.get('selectedIndex')).get(VALUE);

        STORAGESET('intl', selIntl);
        LOC.reload();
    });

    /**
     * Initialization depending on storage-lite readyness. IE<8 issue.
     */
    STORAGE.on('storage-lite:ready', function () {
        /**
         * Set initial slider value from either a persisted value or from slider
         * rail width. A ratio is used to appropriately set a valid size.
         */
        sliderWidth = parseInt(sliderBox.getStyle('width'), 10);
        ratio = (SIZE_MAX - SIZE_MIN + 1) / sliderWidth;
        currentSize = STORAGEGET(SIZE);
        if (currentSize) {
            initialSize = currentSize;
        } else {
            currentSize = sliderWidth;
        }
        slider.update([ROUND((currentSize - SIZE_MIN) / ratio), 0]);
        thumb.removeClass(CLASS_HIDDEN);
        qrimg.removeClass(CLASS_HIDDEN);

        /**
         * Build spoken languages list and set the current language from
         * persisted user's choice or browser default language.
         */
        setLang(STORAGEGET(LANG) || languageShort);
        listStr = SUBS(
            '<div id="lang-hd">{title}</div><ul class="lang-col">',
            {
                title: INTL.spokenLang
            }
        );
        YOBJEACH(langs, function (name, id) {
            listStr += SUBS(
                '<li><a class="lng{cls}" href="#" id="lng-{id}">{name}</a></li>',
                {
                    cls: id === currentLang ? ' ' + CLASS_SELECT : '',
                    id: id,
                    name: name
                }
            );
            langCount += 1;
            if (langCount % LANG_ROWS === 0) {
                listStr += '</ul><ul class="lang-col">';
            }
        });
        listStr += SUBS('</ul><div id="lang-ft">{note}</div>', {
            note: INTL.langsNote
        });
        langList.setContent(listStr);
    });
}, '0.0.1', {
    lang: ['en-US', 'pt-BR'],
    requires: ['node', 'json', 'jsonp', 'dd-constrain',
        'gallery-center', 'gallery-simpleslider', 'gallery-storage-lite']
});
