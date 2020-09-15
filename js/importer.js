

parseFile = content => {
    return JSON.parse(content)
}

loadedMsg = () => {
    alert("Document loaded!")
    console.log("Doc loadeed")
}

function attributeValueHtml(attributeValue) {
    if (Array.isArray(attributeValue)) {
        if (attributeValue.length > 0 && attributeValue[0].$type) {
            return entityHtml("", attributeValue, true)
        } else {
            let nestedAttributeHtml = "";
            let index = 0;
            for (let nestedAttr of attributeValue) {
                nestedAttributeHtml += /* html */`<li>${attributeValueHtml(nestedAttr)}</li>`
            }
            return `<ul class='attributeList'>${nestedAttributeHtml}</ul>`;
        }
    }

    if (typeof attributeValue === "object") {
        let nestedAttributeHtml = "";
        for (let key in attributeValue) {
            nestedAttributeHtml += /* html */`<li>${attributeHtml(key, attributeValue[key])}</li>`
        }
        return `<ul class='attributeList'>${nestedAttributeHtml}</ul>`;
    }

    return /* html */`
            <input value='${attributeValue}'>
        `
}

/**
 * 
 * @param {string} attributeName 
 * @param {string|number|Array|object} attributeValue 
 */
function attributeHtml(attributeName, attributeValue) {
    return /* html */`
        <div class='attribute'>
            <div class='attributeName'>${attributeName}:</div>            
            ${attributeValueHtml(attributeValue)}
        </div>
        `
}

/**
 * 
 * @param {object} component 
 */
function componentHtml(component) {
    let componentName = component.$type.split(".").pop().split(",")[0]
    let attributesHtml = "";
    for (let attribute in component) {
        if (attribute === "$type") continue;
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
 * 
 * @param {string} entityName 
 * @param {object} entity 
 */
function entityHtml(entityName, entity, nested = false) {
    let componentsHtml = "";
    for (let component of entity) {
        componentsHtml += `<li>${componentHtml(component)}</li>`;
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

window.onload = () => {
    let fileInput = document.getElementById("inputFile");
    let list = document.getElementById("entityList");
    fileInput.onchange = changeEvent => {
        let reader = new FileReader()
        reader.onload = fileLoadedEvent => {
            let entities = {}
            try {
                entities = JSON.parse(fileLoadedEvent.target.result)
            } catch (error) {
                console.error(error)
                list.innerHTML = "<li class='errorMsg'>Format does not seem to be valid JSON!</li>"
                return;
            }

            let entitiesHtml = "";
            try {
                for (let entityName in entities) {
                    entitiesHtml += `<li>${entityHtml(entityName, entities[entityName])}</li>`
                }
                list.innerHTML = entitiesHtml;
            } catch (error) {
                console.log(error)
                list.innerHTML = "<li class='errorMsg'>Invalid format!</li>"
            }

        }
        reader.readAsText(fileInput.files[0])
    }
}

