

parseFile = content => {
    return JSON.parse(content)
}

loadedMsg = () => {
    alert("Document loaded!")
    console.log("Doc loadeed")
}

/**
 * 
 * @param {string} attributeName 
 * @param {string|number|Array|object} attributeValue 
 */
function attributeHtml(attributeName, attributeValue) {
    return `
        <li>
            <div class='attribute'>
                ${attributeName}: <input value='${attributeValue}'>
            </div>
        </li>
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
        attributesHtml += attributeHtml(attribute, component[attribute])
    }
    return `
        <li class='component'>
            ${componentName}: 
            <ul>
                ${attributesHtml}
            </ul>
        </li>
        `
}

/**
 * 
 * @param {string} entityName 
 * @param {object} entity 
 */
function entityHtml(entityName, entity) {
    let componentsHtml = "";
    for (let component of entity) {
        componentsHtml += componentHtml(component)
    }
    return `
        <li class='entity'>
            <div class='entityName'>
                ${entityName}
            </div>
            <ul>
                ${componentsHtml}
            </ul>
        </li>
        `
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
                    entitiesHtml += entityHtml(entityName, entities[entityName])
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

