module.exports = {
    postToCard(post, options){
        let postDescription = post.contents.filter((i) => i.typeContent == 'text')[0].content.slice(0, 195) + ' ...'
        let textContent = postDescription
                textContent = textContent.replace(/\[b\](.*)\[\/b\]/gi, function(...args){
                    return `<b>${args[1]}</b>`
                })
                textContent = textContent.replace(/\[i\](.*)\[\/i\]/gi, function(...args){
                    return `<i>${args[1]}</i>`
                })
                textContent = textContent.replace(/\[h4\](.*)\[\/h4\]/gi, function(...args){
                    return `<h4>${args[1]}</h4>`
                })

        const html = `
            <div class="row post-card">
                <div class="col s12 m6 preview">
                    <img src="/${post.mainPhoto}" alt="preview">
                </div>
                <div class="col s12 m6">
                    <div class="post-card__content">
                        <a href="/article/view/${post._id.toString()}"><h4>${post.name}</h4></a>
                        <div class="post-card__description">
                            ${textContent}
                        </div>
                    </div>
                    <br>
                    <a href="/article/view/${post._id.toString()}" class="btn small" >
                        Читать далее ->
                    </a>
                </div>
            </div>
        `

        return html
    },
    postToFullHtml(post, options){
        const tags = post.tags.map( t =>{
            return '<a href="/article/search?searchtext=['+ t +']">' + t +'</a>'
        }).join(', ')
        let html = `
        <div class="row">
            <h3 class="col s12 l8" >${post.name}</h3>
            <div class="col s12 l4 author-info">
                <div>Автор: <a href="/user/${post.author._id}">${post.author.name}</a></div>
                <div class="tags">Тэги: ${tags}</div>
            </div>
        </div>
        `
        post.contents.forEach( part =>{
            if(part.typeContent == 'text'){
                // let temp = str.replace(/\[b\](.*)\[\/b\]/gi, function(...args){
                //     return `<b>${args[1]}</b>`
                //   })
                let textContent = part.content
                textContent = textContent.replace(/\[b\](.*)\[\/b\]/gi, function(...args){
                    return `<b>${args[1]}</b>`
                })
                textContent = textContent.replace(/\[i\](.*)\[\/i\]/gi, function(...args){
                    return `<i>${args[1]}</i>`
                })
                textContent = textContent.replace(/\[h4\](.*)\[\/h4\]/gi, function(...args){
                    return `<h4>${args[1]}</h4>`
                })


                html += `
                    <p>${textContent}</p><br>
                `
            }

            if(part.typeContent == 'img'){
                html += `
                    <img src="/${part.content}" alt="post photo" class="" >
                `
            }
        })

        return html
    },
    postToComment(post, options){
        if(post.comments.length < 1){
            return `
                <p>Комментов пока нет!</p>
            `
        }else{
            let html = `

            `

            post.comments.forEach( com => {
                let photoName = com.commentsAuthor.photoName? com.commentsAuthor.photoName : 'img1.jpg'
                let date = new Date(com.dateCreate).toLocaleString()
                html += `
                <div class="row">
                    <div class="row">
                        <div class="col s4 l2 comment-avatar">
                            <img src="/${photoName}" alt="comment-avatar">
                        </div>
                        <div class="col s4 l2">Автор: <a href="/user/${post.author._id}">${post.author.name}</a></div>
                        <div class="col s4 l2">Дата: <span>${date}</span></div>
                    </div>
                    <div class="row comment-text">
                        ${com.content}
                    </div>
                </div>
                `
            })

            return html
        }
    },
    postToEditPage(post, options){
        let html = `
        
        `
        let tempCounter = 0
        post.contents.forEach( (part, index) => {
            if(part.typeContent == 'text'){
                html += `
                <div class="col s12 post-part">
                    <div class="input-field col s12">
                        <textarea required minlength="20" name="text${index}" id="textarea${index}" class="materialize-textarea">${part.content}</textarea>
                        <label for="textarea${index}">Текст</label>
                    </div>
                    <div class="delete-item waves-red waves-effect"><i class="red-text small material-icons">clear</i></div>
                </div>
            `
            }
            
            if(part.typeContent == 'img'){
                html += `
                <div class="file-field input-field col s12 post-part">
                    <div class="btn">
                        <span>Картинка</span>
                        <input onchange="
                            const file = event.target.files[0]
                            const URLPath = window.URL.createObjectURL(file)
                            document.querySelector('#postContnet #imgcont' + ${index}).src = URLPath
                        " 
                        type="file" id="imgaft${index}" name="img${index}" accept="image/jpeg,image/png,image/jpg">
                    </div>
                    <div class="file-path-wrapper">
                        <input class="file-path validate" type="text">
                        <input type="hidden" value="${part.content}" name="imgI${index}">
                    </div>
                    <div className="content__after">
                        <img src="/${part.content}" alt="загрузите фото" class="post-photo" id="imgcont${index}">
                    </div>
                    <div class="delete-item waves-red waves-effect"><i class="red-text small material-icons">clear</i></div>
                </div>
            `
            }

            tempCounter = index
        })

        html += `<script>window.editableElementCounter$ = ${tempCounter + 1}</script>`

        return html
    },
    getPaginationHtml(postsCount, postsOnPage, limit, search, options){
        let maxLimit = Math.floor(postsCount / postsOnPage)
        let rangeNumberRefs = 2
        let html = `
            <div class="row pagination">
        `
        if(limit > 0){
            html += `
            <a class="pagination__item" href="/article/search?limit=0&searchtext=${search}"> << </a>
            <a class="pagination__item" href="/article/search?limit=${limit-1}&searchtext=${search}"> < </a>
            `
        }else{
            html += `
            <span class="pagination__item deactive"> << </span>
            <span class="pagination__item deactive"> < </span>
            `
        }

        if(limit - rangeNumberRefs > 0){
            html+= `<span> ... </span>`
        }
        
        for(let i = 0; i <= maxLimit; i++){
            if( i < limit){
                if(i >= limit - rangeNumberRefs && i < limit){
                    html+= `<a class="pagination__item" href="/article/search?limit=${i}&searchtext=${search}"> ${i + 1} </a>`
                }
            }else if( i == limit){
                html+= `<a class="pagination__item active" href="#*"> ${i + 1} </a>`
            }else{
                if(i <= limit + rangeNumberRefs && i > limit){
                    html+= `<a class="pagination__item" href="/article/search?limit=${i}&searchtext=${search}"> ${i + 1} </a>`
                }
            }
        }

        if(limit + rangeNumberRefs < maxLimit){
            html+= `<span> ... </span>`
        }
        
        if(limit < maxLimit && postsCount > 10){
            html+= `<a class="pagination__item" href="/article/search?limit=${limit+1}&searchtext=${search}"> > </a>`
            html+= `<a class="pagination__item" href="/article/search?limit=${maxLimit}&searchtext=${search}"> >> </a>`
        }else{
            html+= `<span class="pagination__item deactive"> > </span>`
            html+= `<span class="pagination__item deactive"> >> </span>`
        }
        
        html+='</div>'
        return html
    },
    userPostsToHtml(posts, userDeletedPosts = [], options){
        if(posts && posts.length > 0 || userDeletedPosts && userDeletedPosts.length > 0){
            let html = ''
            html += userDeletedPosts.map( post => {
                return `
                    <span><h5 class="post-profiletext">${post.name} - •${post.initiator == 'u'? 'Удалён' : 'Удалён администрацией'}</h5></span>
                `
            }).join('')
            html += posts.map( post => {
                return `
                    <a href="/article/view/${post._id.toString()}"><h5 class="post-profiletext">${post.name}</h5></a>
                `
            }).join('')
            return html
        }else{
            return '<br><p>Постов пока нет!</p>'
        }
    }
}