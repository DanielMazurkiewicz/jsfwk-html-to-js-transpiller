const cssParse = require('../quickCssParser');
const css=`
.green {
    color: green;
}
.test > div {
    color: red;
}
@media screen and (min-width: 480px) {
    .width {
        color: blue;
    }
    .test > hiv {
        color: yellow;
    }
}
div {
    color: yellow;
}
`
const parsed = cssParse(css);

console.log(parsed);

const obj = cssParse.getObject(parsed);

console.log(obj)

