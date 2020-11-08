let camelcase = require('camelcase-css')

let UNITLESS = require('./constants')

let ANIMATION_NAME_PROPERTY = {
  animation: true,
  animationName: true
}

// let OUTPUT_STYLE_TYPE = {
//   STRING: 'string',
//   OBJECT: 'object'
// }

function atRule (node, parameters = {}) {
  if (typeof node.nodes === 'undefined') {
    return true
  } else {
    return process(node, parameters)
  }
}

function process (node, parameters = {}) {
  let name
  let result = {}

  node.each(child => {
    if (child.type === 'atrule') {
      // atRule includes mediaQueries, keyframes
      name = '@' + child.name
      if (child.params) name += ' ' + child.params
      if (typeof result[name] === 'undefined') {
        result[name] = atRule(child, parameters)
      } else if (Array.isArray(result[name])) {
        result[name].push(atRule(child, parameters))
      } else {
        result[name] = [result[name], atRule(child)]
      }
    } else if (child.type === 'rule') {
      // css rule
      let body = process(child, parameters)
      let selectorName = child.selector
      let subSelectorName = ''

      if (selectorName.includes(':')) {
        let [className, subSelector] = selectorName.split(':')
        if (className !== '&') {
          selectorName = className
          subSelectorName = `&:${subSelector}`
        }
      }
      if (selectorName.length > 0 && selectorName[0] === '.') {
        selectorName = selectorName.substr(1)
      }
      if (subSelectorName) {
        if (result[selectorName]) {
          result[selectorName][subSelectorName] = {}
        } else {
          result[selectorName] = {
            [subSelectorName]: {}
          }
        }
        for (let i in body) {
          result[selectorName][subSelectorName][i] = body[i]
        }
      } else if (result[selectorName]) {
        for (let i in body) {
          result[selectorName][i] = body[i]
        }
      } else {
        result[selectorName] = body
      }
    } else if (child.type === 'decl') {
      // css declaration

      if (child.prop[0] === '-' && child.prop[1] === '-') {
        name = child.prop
      } else {
        switch (parameters.ouputStyleType) {
          // case OUTPUT_STYLE_TYPE.STRING:
          //   name = child.prop
          //   break
          // case OUTPUT_STYLE_TYPE.OBJECT:
          //   name = camelcase(child.prop)
          //   break
          default:
            name = camelcase(child.prop)
            break
        }
      }
      let value = child.value
      if (UNITLESS[child.prop] && !isNaN(child.value)) {
        // convert value from string to number for unitless css styles
        value = parseFloat(child.value)
      }
      if (ANIMATION_NAME_PROPERTY[name]) {
        // add '$' symbol before animation style
        value = '$' + child.value
      }
      if (child.important) value += ' !important'
      if (typeof result[name] === 'undefined') {
        result[name] = value
      } else if (Array.isArray(result[name])) {
        result[name].push(value)
      } else {
        result[name] = [result[name], value]
      }
    }
  })
  return result
}

module.exports = process
