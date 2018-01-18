const parseCss = require('./quickCssParser');

module.exports = (str, fwkVarName) => {
  if (!fwkVarName) fwkVarName = '$';
  let result = '';

  let depthLevel = 0;

  let styles = [];
  let styleMode = false;
  let styleContent;

  let scriptsStatic = [];
  let scriptMode = false;
  let scriptContent;

  let bodyVariables = [];
  let bodyBeforeScripts = [];
  let bodyHTML = [];
  let bodyContentBindings = [];
  let bodyAttributeBindings = {};
  let bodyEventBindings = {};
  let bodyAfterScripts = [];

  let bodyAttributeBindingsLength = 0;
  let bodyEventBindingsLength = 0;
  let bodyElementCloser = [];  

  const getAttributesList = attributes => {
      const result = {};
      attributes.forEach(element => {
          result[element.name] = true;
      });
      return result;
  }

  const parseStyles = () => {
    let result = '';
    const parsed = [];
    styles.forEach(style => {
        parseCss(style.content, parsed);
    });
    const styleObject = parseCss.getObject(parsed);
    let stylesList = [];
    for (let styleName in styleObject) {
        if (styleName === '!') {
            //TODO: something with styles that have no name in it...
        } else {
            stylesList.push(styleName + '=' + fwkVarName + '.style(' + JSON.stringify(styleObject[styleName]) + ')');
        }
    }
    return 'let ' + stylesList.join(',') + ';';
  }

  const parseTagStyle = function(event) {
    styleMode = true;
    styleContent = {content:''}

    var tagName = event.tagName; // String 
    var attributes = event.attributes; // Array 
    var argument = event.argument; // Object 
    var pos = event.pos; // Integer

    styles.push(styleContent);
  }

  const parseTagScript = function(event) {
    scriptMode = true;
    scriptContent = {content:''}
    
    var tagName = event.tagName; // String 
    var attributes = event.attributes; // Array 
    var argument = event.argument; // Object 
    var pos = event.pos; // Integer

    const attributesList = getAttributesList(attributes);
    if (argument && argument.value) {
        let arguments = argument.value.split(',').map(argument=>argument.trim());

        let first = arguments[0];

        switch (first[0]) {
            case '=': //attribute
                let attribute = bodyAttributeBindings[first];
                if (!attribute) {
                    attribute = bodyAttributeBindings[first] = {};
                }
                if (attributesList.set) {
                    attribute.set = scriptContent;
                } else if (attributesList.get) {
                    attribute.get = scriptContent;                    
                } else {
                    attribute.content = scriptContent;                    
                }
                if (attributesList.visible) {
                    attribute.visible = true;
                }
                bodyAttributeBindingsLength++;
                break;

            case '&': //event
                for (let i = 1; i < arguments.length; i++) {
                    const eventsList = bodyEventBindings[arguments[i]];
                    const event = {
                        eventName: first,
                        script: scriptContent
                    }
                    if (!eventsList) {
                        bodyEventBindings[arguments[i]] = [event];
                    } else {
                        eventsList.push(event);
                    }
                    bodyEventBindingsLength++;
                }
                break;

            default:
        }
    } else {
        if (attributesList.static) {
            scriptsStatic.push(scriptContent);
        } else if (attributesList.before) {
            bodyBeforeScripts.push(scriptContent);
        } else if (attributesList.after) {
            bodyAfterScripts.push(scriptContent);            
        } else {
            if (depthLevel) {
                bodyHTML.push(',function(parent){');
                bodyHTML.push(scriptContent);
                bodyHTML.push('}');
            } else {
                bodyHTML.push('\n');
                bodyHTML.push(scriptContent);
                bodyHTML.push('\n');
            }    
        }

    }
  }

  const parseTag = function(event) {
    var tagName = event.tagName; // String 
    var attributes = event.attributes; // Array 
    var argument = event.argument; // Object 
    var pos = event.pos; // Integer
    if (depthLevel) {
        bodyHTML.push(',');
    }
    if (argument && argument.value) {
        let arguments = argument.value.split(',').map(argument=>argument.trim());
        let first = arguments[0];
        if (first[0] == '@') {
              first = first.substr(1);
              bodyContentBindings.push(first);
        }
        bodyHTML.push(first + '=');
        bodyVariables.push(first);
    }
    switch (tagName[0]) {
        case '^':
            bodyHTML.push(fwkVarName +'(' + tagName.substr(1));
            bodyElementCloser.push(')')
            break;

        case '@':
            bodyHTML.push('{' + JSON.stringify(tagName) + ':[');
            bodyElementCloser.push(']}')
            break;

        default:
            bodyHTML.push(fwkVarName +'(' + JSON.stringify(tagName));
            bodyElementCloser.push(')')
        }

    let attributesString = attributes.map(attribute => {
        let value = attribute.value;
        if (value === undefined) value = true;
        return JSON.stringify(attribute.name) + ':' + value;
    }).join(',');
    if (attributesString) {
        bodyHTML.push(',{' + attributesString + '}');
    }

  }

  const parser = require('htmljs-parser').createParser({
      onText: function(event) {
          // Text within an HTML element 
          var value = event.value;
          value = value.trim();
          if (value) {
            if (scriptMode) {
                scriptContent.content += value + '\n';
            } else if (styleMode) {
                styleContent.content += value;
            } else {
                bodyHTML.push(',' + JSON.stringify(value));
            }
          }
      },
   
      onPlaceholder: function(event) {
          //  ${<value>]} // escape = true 
          // $!{<value>]} // escape = false 
          var value = event.value; // String 
          var escaped = event.escaped; // boolean 
          var withinBody = event.withinBody; // boolean 
          var withinAttribute = event.withinAttribute; // boolean 
          var withinString = event.withinString; // boolean 
          var withinOpenTag = event.withinOpenTag; // boolean 
          var pos = event.pos; // Integer 
      },
   
      onCDATA: function(event) {
          // <![CDATA[<value>]]> 
          var value = event.value; // String 
          var pos = event.pos; // Integer 
      },
   
      onOpenTag: function(event) {
          var tagName = event.tagName.toLowerCase(); // String
          if (tagName === 'script') {
              parseTagScript(event);
          } else if (tagName === 'style') {
              parseTagStyle(event);
          } else {
              parseTag(event);
          }
          depthLevel++;
      },
   
      onCloseTag: function(event) {
          // close tag 
          var tagName = event.tagName.toLowerCase(); // String
          var pos = event.pos; // Integer 
          if (tagName === 'script') {
            scriptMode = false;
          } else if (tagName === 'style'){
            styleMode = false;
        } else {
            bodyHTML.push(bodyElementCloser.pop());            
          }
          depthLevel--;
      },
   
      onDocumentType: function(event) {
          // Document Type/DTD 
          // <!<value>> 
          // Example: <!DOCTYPE html> 
          var value = event.value; // String 
          var pos = event.pos; // Integer 
      },
   
      onDeclaration: function(event) {
          // Declaration 
          // <?<value>?> 
          // Example: <?xml version="1.0" encoding="UTF-8" ?> 
          var value = event.value; // String 
          var pos = event.pos; // Integer 
      },
   
      onComment: function(event) {
          // Text within XML comment 
          var value = event.value; // String 
          var pos = event.pos; // Integer 
      },
   
      onScriptlet: function(event) {
          // Text within <% %> 
          var value = event.value; // String 
          var pos = event.pos; // Integer 
      },
   
      onError: function(event) {
          // Error 
          var message = event.message; // String 
          var code = event.code; // String 
          var pos = event.pos; // Integer 
          console.warn(message);
          console.warn(code);
          console.warn(pos);
        }
  });
   
  parser.parse(str);

  if (styles.length) {
    result += parseStyles();
  }

  if (scriptsStatic.length) {
    result += scriptsStatic.map(element=>element.content).join('\n') + '\n';
  }

  result += 'module.exports=(parent,parentNode)=>{';

  if (bodyVariables.length) {
    result += 'let ' + bodyVariables.join(',') + ';';
  }

  if (bodyBeforeScripts.length) {
    result += bodyBeforeScripts.map(element=>element.content).join('\n') + '\n';
  }

  if (bodyHTML.length) {
    result += bodyHTML.map(element=>{
        if (typeof element === 'string') return element;
        if (element.content) return element.content;
        return '';
    }).join('') + ';';
  }

  if (bodyContentBindings.length) {
    result += fwkVarName+'(main,{' +
        bodyContentBindings.map(name => JSON.stringify('+' + name) + ':' + name).join(',') +
    '});';
  }

  if (bodyAttributeBindingsLength) {
    let attributes = [];
    for (let attributeName in bodyAttributeBindings) {
        let attribute = JSON.stringify(attributeName) + ':{';

        const binding = bodyAttributeBindings[attributeName];
        if (binding.content) return binding.content.content;
        const list = [];
        if (binding.set) {
            list.push('set:function(value){' + binding.set.content + '}');
        }
        if (binding.get) {
            list.push('get:function(){' + binding.get.content + '}');
        }
        if (binding.visible) {
            list.push('visible:true');
        }
        attributes.push(attribute + list.join(',') + '}')
    }

    result += fwkVarName +'(main,{' + attributes.join(',') + '});'    
  }

  if (bodyEventBindingsLength) {
      for (let varName in bodyEventBindings) {
        const bindings = bodyEventBindings[varName];
        result+=fwkVarName+'(' + varName + ',{' +
            bindings.map(binding => {
                return JSON.stringify(binding.eventName) + ':function(evt){' +
                    binding.script.content +
                '}';
            }).join(',') +
        '});'
      }
  }

  if (bodyAfterScripts.length) {
    result += bodyAfterScripts.map(element=>element.content).join('\n') + '\n';
  }

  result += 'return main;}';
  return result;
}