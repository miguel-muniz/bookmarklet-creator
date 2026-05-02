const titleInput = document.querySelector('#filename');
const codeTextarea = document.querySelectorAll('textarea')[0];
const bookmarkletTextarea = document.querySelectorAll('textarea')[1];

const generateButton = document.querySelectorAll('button')[0];
const clearButton = document.querySelectorAll('button')[1];
const convertButton = document.querySelectorAll('button')[2];

const bookmarkletLink = document.querySelector('main a');

function formatAsBookmarklet(code) {
    const trimmedCode = code.trim();

    return `javascript:(function(){${encodeURIComponent(trimmedCode)}})();`;
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
    const code = codeTextarea.value;
    const bookmarklet = formatAsBookmarklet(code);

    bookmarkletTextarea.value = bookmarklet;
    updateLink(bookmarklet);
});

clearButton.addEventListener('click', () => {
    codeTextarea.value = '';
    codeTextarea.focus();
});

convertButton.addEventListener('click', async () => {
    const bookmarklet = bookmarkletTextarea.value;
    const code = decodeBookmarklet(bookmarklet);
    const formattedCode = await formatCode(code);

    codeTextarea.value = formattedCode;
});

titleInput.addEventListener('input', () => {
    bookmarkletLink.textContent = titleInput.value.trim() || 'Bookmarklet';
});

generateButton.click();
