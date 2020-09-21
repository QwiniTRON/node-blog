let isBlockExit = true

window.addEventListener('load', (e) => {
    // post = counter
    let postCounter = window.editableElementCounter$? window.editableElementCounter$ : 1
    const $postContnet = document.querySelector('#postContnet')

    // Текст
    document.querySelector('#textBtn').addEventListener('click', (e) => {
        const html = `
            <div class="col s12 post-part">
                <div class="input-field col s12">
                    <textarea required minlength="20" name="text${postCounter}" id="textarea${postCounter}" class="materialize-textarea"></textarea>
                    <label for="textarea${postCounter}">Текст</label>
                </div>
                <div class="delete-item waves-red waves-effect"><i class="red-text small material-icons">clear</i></div>
            </div>
        `
        $postContnet.insertAdjacentHTML('beforeend', html)
        postCounter++
    })

    $postContnet.addEventListener('click', (e)=>{
        if(e.target.parentElement.classList.contains('delete-item')){
            e.target.parentElement.parentElement.remove()
        }
    })

    // Картинка
    document.querySelector('#imageBtn').addEventListener('click', (e) => {
        const localPostCounter = postCounter
        const html = `
            <div class="file-field input-field col s12 post-part">
                <div class="btn">
                    <span>Картинка</span>
                    <input type="file" required id="imgaft${postCounter}" name="img${postCounter}" accept="image/jpeg,image/png,image/jpg">
                </div>
                <div class="file-path-wrapper">
                    <input class="file-path validate" type="text">
                </div>
                <div className="content__after">
                    <img src="" alt="загрузите фото" class="post-photo" id="imgcont${postCounter}">
                </div>
                <div class="delete-item waves-red waves-effect"><i class="red-text small material-icons">clear</i></div>
            </div>
        `
        $postContnet.insertAdjacentHTML('beforeend', html)
        

        $postContnet.querySelector('#imgaft'+ postCounter).onchange = function(e){
            const file = e.target.files[0]
            const URLPath = URL.createObjectURL(file)
            $postContnet.querySelector('#imgcont' + localPostCounter).src = URLPath
        }


        postCounter++
    })
})

// Отправка формы
document.querySelector('#postForm').addEventListener('submit', function(e) {
    const $postForm = document.querySelector('#postForm')

    if (!confirm('Статья готова')){
        e.preventDefault()
        return
    }
        
    
    let partsCounter = 1
    for(let key in $postForm.elements){
        
        if(!isNaN(key)){
            const element = $postForm.elements[key]

            
            if(element.name.startsWith('imgI')){
                element.name = 'imgI' + '/' + (partsCounter - 1)
            }else if(element.name.startsWith('img')){
                element.name = 'img' + '/' + partsCounter
                partsCounter++
            }else if(element.name.startsWith('text')){
                element.name = 'text' + '/' + partsCounter
                partsCounter++
            }
        }
    }
   

    if(partsCounter < 3){
        M.toast({html: 'Добавьте минимум 2 блока'})
        e.preventDefault()
        return
    }

    isBlockExit = false
    // window.onbeforeunload = null
})

// предупреждение 
window.onbeforeunload = function () {
    // if (!confirm('Точно уйти'))
    //     return false
    if(isBlockExit)
        return false
};

