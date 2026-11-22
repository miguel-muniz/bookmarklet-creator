const titleInput = document.querySelector('#filename');
const codeTextarea = document.querySelectorAll('textarea')[0];
const bookmarkletTextarea = document.querySelectorAll('textarea')[1];

const generateButton = document.querySelectorAll('button')[0];
const clearButton = document.querySelectorAll('button')[1];
const convertButton = document.querySelectorAll('button')[2];

const bookmarkletLink = document.querySelector('main a');

function readBookmarkletSource(code) {
    const prefix = '(function(){\n';
    const comments = [];
    acorn.parse(prefix + code + '\n})();', {
        ecmaVersion: 'latest',
        onComment: comments,
    });

    let title;
    let cursor = 0;
    let body = '';
    for (const comment of comments) {
        const start = comment.start - prefix.length;
        const end = comment.end - prefix.length;
        const previousCode = code.slice(cursor, start);

        if (!title && !comment.block && !body.trim() && !previousCode.trim()) {
            title = /^\s*@bookmarklet[ \t]+(.+)$/.exec(comment.value)?.[1].trim();
        }

        body += previousCode + (code.slice(start, end).match(/[\r\n\u2028\u2029]/g)?.join('') || ' ');
        cursor = end;
    }

    return { title, body: (body + code.slice(cursor)).trim() };
}

function decodeBookmarklet(bookmarklet) {
    let code = bookmarklet.trim();

    code = code.replace(/^javascript:/, '');

    try {
        code = decodeURIComponent(code);
    } catch {
        // If decoding fails, continue with the original string
    }

    code = code
        .replace(/^\(function\(\)\{/, '')
        .replace(/\}\)\(\);?$/, '')
        .trim();

    return code;
}

async function formatCode(code) {
    try {
        return await prettier.format(code, {
            parser: "babel",
            plugins: prettierPlugins,
            semi: true,
            singleQuote: true,
        });
    } catch (error) {
        console.warn("Prettier formatting failed:", error);
        return code;
    }
}

function updateLink(bookmarklet) {
    const title = titleInput.value.trim() || 'Bookmarklet';

    bookmarkletLink.textContent = title;
    bookmarkletLink.href = bookmarklet;
}

generateButton.addEventListener('click', () => {
    let source;
    try {
        source = readBookmarkletSource(codeTextarea.value);
    } catch (error) {
        codeTextarea.setCustomValidity(error.message);
        codeTextarea.reportValidity();
        return;
    }

    if (source.title) {
        titleInput.value = source.title;
    }

    const bookmarklet = `javascript:(function(){${encodeURIComponent(source.body)}})();`;

    bookmarkletTextarea.value = bookmarklet;
    updateLink(bookmarklet);
});

codeTextarea.addEventListener('input', () => codeTextarea.setCustomValidity(''));

clearButton.addEventListener('click', () => {
    codeTextarea.setCustomValidity('');
    codeTextarea.value = '';
    codeTextarea.focus();
});

convertButton.addEventListener('click', async () => {
    const bookmarklet = bookmarkletTextarea.value;
    const code = decodeBookmarklet(bookmarklet);
    const formattedCode = await formatCode(code);

    codeTextarea.value = formattedCode;
    codeTextarea.setCustomValidity('');
});

titleInput.addEventListener('input', () => {
    bookmarkletLink.textContent = titleInput.value.trim() || 'Bookmarklet';
});

generateButton.click();
