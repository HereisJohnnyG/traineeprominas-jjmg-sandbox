const modelStudent = require("../model/student");
const modelCourse = require("../model/course");
const Joi = require("joi");
const mongoose = require("mongoose");
const Schema = require("../schema").studentSchema;
const Student = mongoose.model('student', Schema);

//----------------------USER VALIDATION-----------//
const schema = Joi.object().keys({
    name: Joi.string().required()
    .error(errors => {
        return {
          message: "O campo name está incorreto ou não foi informado",
        };
    }),
	lastname: Joi.string().required()
    .error(errors => {
        return {
          message: "O campo lastname está incorreto ou não foi informado",
        };
    }),
    age: Joi.number().required()
    .error(errors => {
        return {
          message: "O campo age está incorreto ou não foi informado",
        };
    }),
    course: Joi.number().required()
    .error(errors => {
        return {
          message: "O campo course está incorreto ou não foi informado",
        };
    }),
});
//-----------------------------------------------//


exports.getAll = (req, res) => {
    let where = {status:1};
    let collun = {"_id": 0, "status": 0, "course._id": 0, "course.status": 0, "course.teacher._id": 0, "course.teacher.status": 0};
    modelStudent.get(where, collun).then(estudantes =>{
        if(estudantes.length > 0){
            res.json(estudantes);
        }else res.status(204).json("Nenhum valor a ser exibido");
    }).catch(err => {
        console.error("Ocorreu um erro ao conectar ao banco de dados");
        res.json.status(500);
    })
}
  
exports.getOne = (req, res) => {
    let id = parseInt(req.params.id);
    let where = {"id": id, status:1};
    let collun = {"_id": 0, "status": 0, "course._id": 0, "course.status": 0, "course.teacher._id": 0, "course.teacher.status": 0};
    modelStudent.get(where, collun).then(estudantes =>{
        if(estudantes.length > 0){
            res.json(estudantes);
        }else res.status(204).json("Nenhum valor a ser exibido");
    }).catch(err => {
        console.error("Ocorreu um erro ao conectar ao banco de dados");
        send.status(500);
    })
} 


exports.post = (req, res) => {
    let students = {};
    students.name = req.body.name;
    students.lastname = req.body.lastname;
    students.age = req.body.age;
    students.course = [];
    let student_temp = [];
    student_temp.push(req.body.course);
    students.status = 1;
    students.id = modelStudent.getId();
    //-------------Joi Validation--------------------//
    schema.validate(req.body, {abortEarly: false}).then(validated => {
    //----------------------------------------------//
    (async function() {
        for (let i = 0; i < student_temp.length; i++) {
            let int = student_temp[i];
            let courses = await modelCourse.get_without_array({id: int, status: 1});
            if(courses){           
                students.course.push(courses);
            }
        }

        //----------------------MONGOOSE VALIDATION AND DATABASE STORAGE--------//
        let valid = new Student(students);
        valid.validate(error => {
            if(!error){
                modelStudent.insertStudent(students).then( result => {
                    res.status(201).json("Estudante Cadastrado com Sucesso.");
                })
            }else{
                modelStudent.setId();
                if(error.errors.age != null){
                    fail = error.errors.age.message
                }
                else fail = error.errors.course.message;
                res.status(401).json(fail);
            }
        })
        //--------------------------ASYNC CATCH-----------------------------//
    })().catch(err => {
        modelStudent.setId();
        console.error("Erro ao cadastrar um novo estudante", err);
        res.status(500).json("Erro ao conectar com o banco de dados");
    });
    //-------------------JOI VALIDATION ------------//
    }).catch(validationError=>{
        modelStudent.setId();
        res.status(401).json(validationError.message);
    });
}


exports.delete = (req, res) => {
    let id = parseInt(req.params.id);
    where = {"id": id, "status": 1};
    set = {$set: {status: 0}}
    modelStudent.delete(where, set).then(results => { 
      if(results == null) {
        res.status(204).json("Não foi possivel encontrar o usuário")
      }else res.json("Estudante excluido com sucesso");
    }).catch(e => {
        console.error("Ocorreu um erro ao deletar os estudante do banco de dados");
        res.status(500);
    })
}

exports.edit = (req, res) => {
    let students = {};
    students.name = req.body.name;
    students.lastname = req.body.lastname;
    students.age = req.body.age;
    students.course = [];
    let student_temp = []; 
    student_temp.push(req.body.course);

    let id = parseInt(req.params.id);
    students.id = parseInt(req.params.id);
    let ide = parseInt(req.params.id);
    //-------------Joi Validation--------------------//
    schema.validate(req.body, {abortEarly: false}).then(validated => {
    //----------------------------------------------//
    (async function() {
        for (let i = 0; i < student_temp.length; i++) {
            let int = student_temp[i];
            int = student_temp[i];
            let courses = await modelCourse.get_without_array({id: int, status: 1});
            if(courses){
                students.course.push(courses);
            }
        }
        let valid = new Student(students);
        valid.validate(error => {
            if(!error){
               let where = {"id": ide, "status": 1};

               modelStudent.updateStudent(where,students)
                .then(result => {
                if(result){ res.status(200).json("Estudante editado com Sucesso.");}
                else{  res.status(401).json("Estudante não encontrado");}
                })
            }else{
                if(error.errors.age != null){
                    fail = error.errors.age.message
                }
                else fail = error.errors.course.message;
                res.status(401).json(fail);
            }
        })
    })().catch(e => {
            console.error("Erro ao editar Estudante:", e);
            res.status(401).json("Ocorreu um erro ao editar Estudante:");
    });
    //-------------------JOI Validation ------------//
    }).catch(validationError=>{
        res.status(401).json(validationError.message);
    });
}