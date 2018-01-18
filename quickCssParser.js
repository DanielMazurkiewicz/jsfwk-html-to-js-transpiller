const bracketsFind = (text, openingCallback, closingCallback) => {
    let from = 0;
    for(var i=0; i<text.length; i++) {
        switch (text[i]) {
            case '{':
                openingCallback(text.substring(from, i).trim());
                from = i+1;
                break;
            case '}':
                closingCallback(text.substring(from, i).trim());
                from = i+1;
                break;
        }
    }
}

const wordFind = (text, position, callback) => {
    if (!text) return -1;

    position = position || 0;
    let repeat = true;
    while (repeat) {
        switch (text[position]) {
            case ' ':
            case '\t':
            case '\n':
                position++;
                break;
            default:
                repeat = false;
        }
        if (position >= text.length) return -1;
    }
    const from = position;
    repeat = true;
    while(repeat) {
        switch (text[position]) {
            case '#':
            case '.':
            case '*':
            case ':':
                if (position!=from) {
                    callback(text.substring(from, position).trim());
                    return position;    
                }
                break; //these characters as first ones in a word are valid
            case ' ':
            case '\t':
            case '\n':
            case ',':
            case '>':
            case '+':
            case '~':
            case ':':
            case '[':
            case ']':
            case '{':
            case '}':
            case '=':
            case '^':
            case '$':
                callback(text.substring(from, position).trim());
                return position;
            default:
        }
        position++;
        if (position >= text.length) {
            callback(text.substring(from, position).trim());
            return position;        
        }
    }
}

module.exports = function (cssText, results) {
    results = results || [];

    let media, name, selector, content;
    let depth = 0;

    bracketsFind(cssText, function(opening) {
        let startWord;
        let startWordEnd = wordFind(opening, 0, (word) => {startWord = word});
        let rest = opening.substr(startWordEnd).trim();

        if (startWord.toLowerCase() === '@media') {
            media = rest;
        } else if (startWord.startsWith('.')) {
            name = startWord.substr(1);
            selector = rest;
        } else {
            name = undefined;
            selector = opening;            
        }
        depth++;
    }, function(closing){
        results.push({
            media,
            name,
            selector,
            content: closing
        });

        depth--;

        if (!depth) {
            media = undefined;
        }
    });
    return results;
}
module.exports.getObject=(parsedArray, destination) => {
    if (!destination && !parsedArray.length) return;

    destination = destination || {};
    parsedArray.forEach(style => {
        let current;
        let name = style.name;
        if (!name) name = '!';
        current = destination[name];
        if (!current) {
            current = destination[name] = {};
        }

        let media = style.media;
        if (!media) media = '!';
        
        if (!current[media]) {
            current = current[media] = {};            
        } else {
            current = current[media];
        }

        let selector = style.selector;
        if (!selector) selector = '!';
        if (current[selector]) {
            current[selector] += style.content;
        } else {
            current[selector] = style.content;            
        }
    });
    return destination;
}