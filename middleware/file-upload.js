const multer = require('multer')
const uuid = require('uuid')

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg',
}

const fileUpload = multer({
    limits: 500000, // limit of file in bytes
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/images')
        },
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype] // extraction the file extension from mimetype exposed by multer
            cb(null, uuid.v4() + '.' + ext)
        },
        fileFilter: (req, file, cb) => {
            //precisamos chamar a função de callback tanto para a chance de sucesso, ou seja, quando o tipo do arquivo for encontrado
            // em MIME_TYPE_MAP, e para o casso de não conter. Quando conter, trataremos a requisição e salvaremos o arquivo. Caso não contenha, jogaremos um erro HTTP.

            // o tipo do arquivo passado para a função está no MIME_TYPE_MAP? 
            // caso file.mimetype não exista em MIME_TYPE_MAP, essa expressão avaliará como undefined.
            // para tornarmos mais lógico e a tipagem mais restrita, utilizamos o operador "!!" para convertermos os retornos para um esquema booleano.
            // ou seja, avaliação de um undefined será transformada em false, assim como os possívesis valores encontrados serão transformados em true.
            const isValid = !!MIME_TYPE_MAP[file.mimetype] 
            
            // Como dito anteriormente, precisamos do caso de sucesso e de erro. 
            // Esta função de callback do mutter recebe como primeiro argumento o possível erro,
            // e se não há erros esse argumento deve ser passado como nulo. Assim, podemos declarar
            // uma variável que inicializada dinâmicamente de acordo com o resultado de isValid.
            // Assim:
            let error = isValid ? null : new Error("Invalid mime type!");
            cb(error, isValid)
        }
    })
})

module.exports = fileUpload;