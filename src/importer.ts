const fs = require("fs")

let entities = {}
let filename: string

// https://stackoverflow.com/questions/423376/how-to-get-the-file-name-from-a-full-path-using-javascript
function filenameFromPath(path: string) {
    return path.split('\\').pop().split('/').pop()
}

function initExportButton() {

    let exportButton = <HTMLButtonElement>document.getElementById("exportButton")

    exportButton.classList.add("hide")

    exportButton.addEventListener("click", event => {
        let serialized = JSON.stringify(entities, null, 4)
        console.log(serialized)
        fs.writeFileSync(filename, serialized)
    })
}


/**
 * watches for changes in #inputFile input
 * on change parses and displays entities in file 
 */
function initImporter() {

    let fileInput = <HTMLInputElement>document.getElementById("inputFile")
    let list = document.getElementById("entityList")
    fileInput.onchange = changeEvent => {
        let reader = new FileReader()
        reader.onload = fileLoadedEvent => {
            try {
                let result = <string>fileLoadedEvent.target.result
                entities = JSON.parse(result)
            } catch (error) {
                console.error(error)
                list.innerHTML = /* html */`<li class='errorMsg'>Format does not seem to be valid JSON!</li>`
                return
            }

            try {
                for (let entityName in entities) {
                    list.append(wrap("li", entityHtml(entityName, entities[entityName])))
                }
                filename = filenameFromPath(fileInput.value)
                let exportButton = <HTMLButtonElement>document.getElementById("exportButton")
                exportButton.setAttribute("href", filename)
                exportButton.classList.remove("hide")
            } catch (error) {
                console.log(error)
                list.innerHTML += /* html */`<li class='errorMsg'>Invalid format!</li>`
            }

        }
        reader.readAsText(fileInput.files[0])
    }
}

function wrap(tagName: string, inner: HTMLElement | string, classes: Array<string> = []) {

    let el = document.createElement(tagName)

    if (typeof inner === "string") el.innerHTML = inner
    else el.append(inner)

    if (classes.length > 0) el.classList.add(...classes)

    return el
}

interface Component {
    $type: string
}

function isComponent(obj: object): obj is Component {
    return (<Component>obj).$type !== undefined
}

function entityHtml(entityName: string, entity: Array<Component>, nested = false) {

    let componentList = document.createElement("ul")
    componentList.classList.add("componentList")

    for (let component of entity) {
        componentList.append(wrap("li", componentHtml(component)))
    }

    let entityElem = document.createElement("div")
    entityElem.classList.add("entity")

    if (nested) {
        entityElem.classList.add("nested")
        componentList.classList.add("nested")
    } else {
        entityElem.append(wrap("h2", entityName, ["entityName"]))
    }

    entityElem.append(componentList)

    return entityElem
}

function componentHtml(component: Component) {
    let componentName = component.$type.split(".").pop().split(",")[0]

    let attributeList = document.createElement("ul")
    attributeList.classList.add("attributeList")

    for (let attribute in component) {
        if (attribute === "$type") continue
        attributeList.append(wrap("li", attributeHtml(component, attribute)))
    }

    let componentElement = wrap("div", wrap("span", componentName, ["componentName"]), ["component"])

    componentElement.append(attributeList)

    return componentElement
}

function attributeHtml(component: Component | object, attributeName: string) {

    let attributeElement = wrap("div", wrap("div", attributeName, ["attributeName"]), ["attribute"])
    attributeElement.append(attributeValueHtml(component, attributeName))
    return attributeElement
}

function attributeValueHtml(parent: object | ArrayLike<any>, attributeName: string | number) {

    let attributeValue: string | number | boolean | Array<any> | object = parent[attributeName]

    if (Array.isArray(attributeValue)) {
        if (attributeValue.length > 0 && isComponent(attributeValue[0])) {
            return entityHtml("", attributeValue, true)
        } else {
            let index = 0
            let valueList = document.createElement("ul")
            valueList.classList.add("attributeValueList")
            for (let nestedAttr of attributeValue) {
                valueList.append(wrap("li", attributeValueHtml(attributeValue, index++)))
            }
            return valueList
        }
    }

    if (typeof attributeValue === "object") {
        let attributeList = document.createElement("ul")
        attributeList.classList.add("attributeList")
        for (let key in attributeValue) {
            attributeList.append(wrap("li", attributeHtml(attributeValue, key)))
        }
        return attributeList
    }

    // type is string/number/bool
    let input = document.createElement("input")
    input.setAttribute("value", attributeValue.toString())
    input.addEventListener("change", event => {
        let value = (<HTMLInputElement>event.target).value
        let num = Number(value);
        if (!Number.isNaN(num)) {
            parent[attributeName] = num
        } else if (value.toLowerCase() === "true") {
            parent[attributeName] = true
        } else if (value.toLowerCase() === "false") {
            parent[attributeName] = false
        } else {
            parent[attributeName] = value
        }
    })
    return input
}