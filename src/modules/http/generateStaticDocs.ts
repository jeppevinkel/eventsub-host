import {createElement} from 'typedoc/dist/lib/utils/jsx'
import * as fs from 'fs'
import hljs from 'highlight.js'

function interfaceToString(inter: any) {
    let str = '{\n'
    for (const property of inter.children) {
        str += `    ${property.name}: ${unpackType(property.type, 2, inter.comment?.tags, property.flags, property.name)}\n`
    }
    str += '}'
    return str
}

function unpackType(type: any, indent = 0, tags: any = undefined, flags: any = undefined, propertyName: string = '') {
    if (type.type === 'intrinsic') {
        const propertyValues = new Map<string, string>()
        tags?.filter((tag: { tag: string, text: string }) => tag.tag === 'property')?.forEach((tag: { tag: string, text: string }) => {
            let [key, value] = tag.text.split(' ')
            value = value.replace(/^\s+|\s+$/g, '')
            propertyValues.set(key, value)
        })

        const defaultValue = propertyValues.get(propertyName)

        if (defaultValue) return defaultValue

        return `${flags?.isOptional ? 'undefined | ' : ''}${type.name}`
    }

    if (type.type === 'reflection') {
        let str = '{\n'
        if (type.declaration.children) {
            for (const child of type.declaration.children) {
                str += `${''.padStart(indent * 4)}${child.name}: ${unpackType(child.type, indent + 1, tags, child.flags, child.name)}\n`
            }
        }
        str += ''.padStart((indent - 1) * 4) + '}'

        return str
    }

    if (type.type === 'union') {
        return type.types.map((type: any) => unpackType(type, indent, tags, null)).join(' | ')
    }

    if (type.type === 'literal') {
        return '"' + type.value + '"'
    }
}

const interfaces = require('../../../resources/websocket-messages.json').children.filter((child: any) => child?.comment?.tags?.some((tag: any) => tag.tag === 'title'))

for (const inter of interfaces) {
    inter.codeBlock = interfaceToString(inter)
}

let html = ''

for (const inter of interfaces) {
    html += `<article>
        <h3>${inter.comment.tags.find((tag: {tag: string, text: string}) => tag.tag === 'title').text}</h3>
        ${inter.comment.shortText ? `<p>${inter.comment.shortText}</p>` : ''}

    <pre><code class="hljs language-yaml">${hljs.highlight(inter.codeBlock, {language: 'yaml'}).value}</code></pre>
    </article>`
}

fs.writeFileSync('./public/partials/event-references.html', html)