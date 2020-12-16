import {getEl, makeEl} from  "./modules/Elements.js"

const start = ()=>{
    let main = getEl('#main')
    let formHolder = makeEl('div', {id:'form-holder'})
    let form = makeEl('form', {is:"todo-form"})
    form.addEventListener('submit', (evt)=>{
        let formValues = formHandler(evt)//same basically as the formhandler from form exercise
    })
    formHolder.append(form)
    main.append(formHolder)
}
document.addEventListener('DOMContentLoaded', start)