# jsfwk-html-to-js-transpiller
Transpiles HTML code to [JS FWK](https://github.com/DanielMazurkiewicz/jsfwk) widget javascript code

### <SCRIPT>

#### STATIC

Code in given script will be executed once, on module load

Example:
```html
<script static>
    let widget = require('widget');
</script>
```

#### BEFORE

Code in given script will execute before widget DOM is build

Example:
```html
<script before>
    alert('Wiget execution begins');
</script>
```

#### AFTER

Code in given script will execute after widget DOM is build

Example:
```html
<script after>
    alert('Widget execution ends');
</script>
```

#### STATIC AFTER

Code in given script will be executed once, on module load, but after widget instantiation.

Example:
```html
<script static after>
    module.exports.widgetManifest = {
      name: 'Hello kitty ;-)'
    }
</script>
```

### <SCRIPT(=...)>

#### SET

Code of given script will be converted to widget attribute setter. Value to set attribute is passed through "value" variable. See example.

Example:
```html
<script(=customAttribute) set>
    console.log(value);
</script>
```

#### GET

Code of given script will be converted to widget attribute getter. 

Example:
```html
<script(=customAttribute) get>
    return 'hello';
</script>
```

#### VISIBLE

This will make changes to attributes visible to DOM (by default attribute changes are hidden to DOM)

Example:
```html
<script(=customAttribute) set visible>
    console.log(value);
</script>
```

### <SCRIPT(&...)>

This will assign event to DOM element.

Example:
```html
<button(plusOne)>+1</button>
<script(&click, plusOne)>
    alert('button clicked');
</script>
```
This example will assign a 'click' event to button named plusOne;


### <STYLE>

Styles must have named selectors. Names of selectors becomes available to HTML elements as local static variables

Example:
```html
<style>
    .green {
        color: green;
    }
    .red > div {
        color: red;
    }
    @media screen and (min-width: 480px) {
        .blue {
            color: blue;
        }
    }
</style>

<div class=[red,green,blue]>
```

_NOTE the usage of class attribute and that styles will produce static variables so remember not to create other variables and constants with same name and once you change a value of such a variable, a new value will apply to every new instance of widget_
```javascript
let red, green, blue;
```


### <^...>

Append widget into DOM

Example:
```html
<script static>
    const widget = require('./widget.html');
</script>
<^widget>
    hello world from widget!!! ;-)
</^widget>
```

#### <@...>

Widget DOM placeholder, all elements will be attached into defined in widget place.
Example:
```html
<script static>
    const widget = require('./widget.html');
</script>
<^widget>
    <@title><img src='dozy.jpg>'/> Dozy </@title>
    <@content> A beautifull flower </@content>        
</^widget>
```

### <...(...)>

This creates named HTML element, a variable for quick access to element.

_CAUTION!!! There must be one element named "main". This element will be returned as widget root._

Example:
```html
<div(main)>
    <div(shortInfo)/>
    <div(fullInfo)/>
</div>

<script after>
    shortInfo.innerHTML = 'some short info';
    main.className = '';
</script>
```

#### <...(@...)>

This creates widget's placeholder and named HTML element (a variable for quick access to element).
Default placeholder for appending new elements to widget is 'main' element, but if you wish to change it define '@content' placeholder.

Example:
```html
<div(main)>
    <div(@leftPanel)/>
    <div(@rightPanel)/>
</div>
```
_NOTE that it also creates variables for quick access to placeholders_

## Check example to see it in action:
[JS FWK html example on github](https://github.com/DanielMazurkiewicz/jsfwk-app-example-html)