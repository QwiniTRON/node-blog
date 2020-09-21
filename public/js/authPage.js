M.Tabs.init(document.querySelectorAll('.tabs'));

document.querySelector('#passwordr').addEventListener('change', function(e){
    const $passwordInput = document.querySelector('#password')
    const $passwordrInput = this
    if($passwordInput.value != $passwordrInput.value){
        $passwordrInput.setCustomValidity('Пароли не совпадают')
    }else{
        $passwordrInput.setCustomValidity('')
    }
})