/* Copyright (c) 2011, Marcel Duran */

/*global YUI*/
YUI.add('lang/qrvoice_es-419', function (Y) {
    'use strict';
    Y.Intl.add('qrvoice', 'es-419', {
        direction: 'ltr', // left-to-right
        tagline: 'cuando una imagen vale más que mil palabras',
        help: 'ayuda',
        faq: 'preguntas frecuentes',
        faqFile: 'faq_en-US.html',
        placeholder: 'Diga algo!',
        msgTitle: 'texto a voz (100 caracteres máximo)',
        genLabel: 'generar',
        genTitle: 'generar qr-voice',
        whichLang: 'en {lang}',
        spokenLang: 'Idioma',
        langs: { // message spoken language
            af: 'afrikaans',
            sq: 'albanés',
            ar: 'árabe',
            hy: 'armenio',
            ca: 'catalán',
            zh: 'chino',
            hr: 'croata',
            cs: 'checo',
            da: 'danés',
            nl: 'holandés',
            en: 'inglés',
            fi: 'finlandés',
            fr: 'francés',
            de: 'alemán',
            el: 'griego',
            ht: 'criollo haitiano',
            hi: 'hindi',
            hu: 'húngaro',
            is: 'islandés',
            id: 'indonesio',
            it: 'italiano',
            ja: 'japonés',
            ko: 'coreano',
            la: 'latin',
            lv: 'lituano',
            mk: 'macedonio',
            no: 'noruego',
            pl: 'polaco',
            pt: 'portugués',
            ro: 'rumano',
            ru: 'ruso',
            sr: 'serbio',
            sk: 'eslovaco',
            es: 'español',
            sw: 'suajili',
            sv: 'sueco',
            ta: 'tamil',
            tr: 'turco',
            vi: 'vietnamita',
            cy: 'galés'
        },
        langsNote: 'idioma sólo para reproducción, no para traducción',
        'resizeTitle': 'cambiar el tamaño del qr-code',
        linkTitle: 'enlace a esta imagen qr-code',
        imgTitle: 'qr-code para reproducir el mensaje, guardar/escanear esta imagen o copiar el enlace de arriba',
        facebookButton: 'Me gusta',
        twitterButton: 'Twittear',
        intls: { // user interface language
            'en-US': {
                name: 'inglés (Estados Unidos)',
                ownName: 'English (United States)'
            },
            'es-419': {
                name: 'español (Latinoamérica)'
            },
            'fr': {
                name: 'francés',
                ownName: 'français'
            },
            'ja': {
                name: 'janopnés',
                ownName: '日本語'
            },
            'pt-BR': {
                name: 'portugués (Brasil)',
                ownName: 'português (Brasil)'
            },
            'zh-CN': {
                name: 'chino (han simplificado)',
                ownName: '中文（简体中文）'
            }
        },
        intlsTitle: 'idioma de la interfaz de usuario',
        disclaimer: 'exención de responsabilidad: qrvoice no está afiliado con Yahoo!&trade; Inc., Google&trade; Inc. o bitly&trade; Inc. de ninguna manera.'
    });
}, '0.0.1');
