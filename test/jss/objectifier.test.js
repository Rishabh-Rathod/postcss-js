let parse = require('postcss').parse

let postcssJS = require('../..')

it('converts declaration', () => {
  let root = parse('color: black')
  expect(postcssJS.convert(root)).toEqual(`color: 'black'`)
})

it('converts declarations to array', () => {
  let root = parse('color: black; color: rgba(0,0,0,.5); color: #000.5;')
  expect(postcssJS.convert(root)).toEqual({
    color: ['black', 'rgba(0,0,0,.5)', '#000.5']
  })
})

it('converts at-rules to array', () => {
  let root = parse(
    '@font-face { font-family: A }' +
      '@font-face { font-family: B }' +
      '@font-face { font-family: C }'
  )
  expect(postcssJS.convert(root)).toEqual({
    '@font-face': [
      { fontFamily: 'A' },
      { fontFamily: 'B' },
      { fontFamily: 'C' }
    ]
  })
})

it('converts declarations to camel case', () => {
  let root = parse('-webkit-z-index: 1; -ms-z-index: 1; z-index: 1')
  expect(postcssJS.convert(root)).toEqual(`WebkitZIndex: '1',
msZIndex: '1',
zIndex: 1`)
})

it('maintains !important declarations', () => {
  let root = parse('margin-bottom: 0 !important')
  expect(postcssJS.convert(root)).toEqual(`marginBottom: '0 !important'`)
})

it('ignores comments', () => {
  let root = parse('color: black; /* test */')
  expect(postcssJS.convert(root)).toEqual(`color: 'black'`)
})

it('converts rules', () => {
  let root = parse('&:hover { color: black }')
  expect(postcssJS.convert(root)).toEqual({
    '&:hover': {
      color: 'black'
    }
  })
})

it('merge rules', () => {
  let root = parse('div { color:blue } div { padding:5px }')
  expect(postcssJS.convert(root)).toEqual({
    div: {
      color: 'blue',
      padding: '5px'
    }
  })
})

it('converts at-rules', () => {
  let root = parse('@media screen { color: black }')
  expect(postcssJS.convert(root)).toEqual({
    '@media screen': {
      color: 'black'
    }
  })
})

it('converts at-rules without params', () => {
  let root = parse('@media { color: black }')
  expect(postcssJS.convert(root)).toEqual({
    '@media': {
      color: 'black'
    }
  })
})

it('converts at-rules without children', () => {
  let root = parse('@media screen { }')
  expect(postcssJS.convert(root)).toEqual({
    '@media screen': {}
  })
})

it('does fall on at-rules in rules merge', () => {
  let root = parse('@media screen { z-index: 1 } z-index: 2')
  expect(postcssJS.convert(root)).toEqual({
    '@media screen': {
      zIndex: 1
    },
    'zIndex': 2
  })
})

it('converts at-rules without body', () => {
  let root = parse('@charset "UTF-8"')
  expect(postcssJS.convert(root)).toEqual(`@charset "UTF-8": true`)
})

it('handles mixed case properties', () => {
  let root = parse('COLOR: green; -WEBKIT-border-radius: 6px')
  expect(postcssJS.convert(root)).toEqual(`color: 'green',
WebkitBorderRadius: '6px'`)
})

it("doesn't convert css variables", () => {
  let root = parse('--test-variable: 0;')
  expect(postcssJS.convert(root)).toEqual(`--test-variable: '0'`)
})

it('converts unitless value to number instead of string', () => {
  let root = parse('z-index: 100; opacity: .1;')
  expect(postcssJS.convert(root)).toEqual(`zIndex: 100,
opacity: 0.1`)
})

it('remove period `.` from css classname', () => {
  let root = parse('.button{ color: black; }')
  expect(postcssJS.convert(root)).toEqual({
    button: { color: 'black' }
  })
})

it('css Pseudo Classes support', () => {
  let root = parse(
    `/* unvisited link */
    a:link {
      color: green;
    }

    /* visited link */
    a:visited {
      color: green;
    }

    /* mouse over link */
    a:hover {
      color: red;
    }

    /* selected link */
    a:active {
      color: yellow;
    }`
  )
  expect(postcssJS.convert(root)).toEqual({
    a: {
      '&:hover': { color: 'red' },
      '&:active': { color: 'yellow' },
      '&:visited': { color: 'green' },
      '&:link': { color: 'green' }
    }
  })
})

it('add "$" symbol before css keyframes animation name', () => {
  let root = parse(`
  @keyframes slideRight {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .container {
    animation-name: slideRight;
  }`)
  expect(postcssJS.convert(root)).toEqual({
    '@keyframes slideRight': {
      from: { opacity: 0 },
      to: { opacity: 1 }
    },
    'container': {
      animationName: '$slideRight'
    }
  })
})
