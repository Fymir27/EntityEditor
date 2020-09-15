/**
 * watches for changes in #inputFile input
 * on change parses and displays entities in file 
 */
window.onload = () => {
    let fileInput = <HTMLInputElement>document.getElementById("inputFile")
    let list = document.getElementById("entityList")
    fileInput.onchange = changeEvent => {
        let reader = new FileReader()
        reader.onload = fileLoadedEvent => {
            let entities = {}
            try {
                let result = <string>fileLoadedEvent.target.result
                entities = JSON.parse(result)
            } catch (error) {
                console.error(error)
                list.innerHTML = /* html */`<li class='errorMsg'>Format does not seem to be valid JSON!</li>`
                return
            }

            let entitiesHtml = ""
            try {
                for (let entityName in entities) {
                    entitiesHtml += /* html */`<li>${entityHtml(entityName, entities[entityName])}</li>`
                }
                list.innerHTML = entitiesHtml
            } catch (error) {
                console.log(error)
                list.innerHTML = /* html */`<li class='errorMsg'>Invalid format!</li>`
            }

        }
        reader.readAsText(fileInput.files[0])
    }
}

interface Component {
    $type: string
}

function isComponent(obj: object): obj is Component {
    return (<Component>obj).$type !== undefined
}

/**
 * @param {string} entityName 
 * @param {Array<Component>} entity 
 */
function entityHtml(entityName: string, entity: Array<Component>, nested = false) {
    let componentsHtml = ""
    for (let component of entity) {
        componentsHtml += `<li>${componentHtml(component)}</li>`
    }

    let nameHtml = nested ? "" : /* html */`<h2 class='entityName'>${entityName}</h2>`
    let extraClasses = nested ? "nested" : ""

    return /* html */`
        <div class='entity ${extraClasses}'>
            ${nameHtml}
            <ul class='componentList ${extraClasses}'>
                ${componentsHtml}
            </ul>
        </div>`
}

/**
 * @param {Component} component 
 */
function componentHtml(component: Component) {
    let componentName = component.$type.split(".").pop().split(",")[0]
    let attributesHtml = ""
    for (let attribute in component) {
        if (attribute === "$type") continue
        attributesHtml += `<li>${attributeHtml(attribute, component[attribute])}</li>`
    }
    return /* html */`
        <div class='component'>
            <span class='componentName'>${componentName}</span>
            <ul class='attributeList'>
                ${attributesHtml}
            </ul>
        </div>`
}

/**
 * @param {string} attributeName 
 * @param {string|number|Array|object} attributeValue 
 */
function attributeHtml(attributeName: string, attributeValue: string | number | Array<any> | object) {
    return /* html */`
        <div class='attribute'>
            <div class='attributeName'>${attributeName}:</div>            
            ${attributeValueHtml(attributeValue)}
        </div>`
}

/**
 * @param {string|number|Array|object} attributeValue 
 */
function attributeValueHtml(attributeValue: string | number | Array<any> | object) {

    if (Array.isArray(attributeValue)) {
        if (attributeValue.length > 0 && isComponent(attributeValue[0])) {
            return entityHtml("", attributeValue, true)
        } else {
            let nestedAttributeHtml = ""
            let index = 0
            for (let nestedAttr of attributeValue) {
                nestedAttributeHtml += /* html */`<li>${attributeValueHtml(nestedAttr)}</li>`
            }
            return /* html */`<ul class='attributeList'>${nestedAttributeHtml}</ul>`
        }
    }

    if (typeof attributeValue === "object") {
        let nestedAttributeHtml = ""
        for (let key in attributeValue) {
            nestedAttributeHtml += /* html */`<li>${attributeHtml(key, attributeValue[key])}</li>`
        }
        return /* html */`<ul class='attributeList'>${nestedAttributeHtml}</ul>`
    }

    // type is string/number
    return /* html */`<input value='${attributeValue}'>`
}