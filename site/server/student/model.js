class Student {
    constructor(id, name, email, password, availableClasses) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.availableClasses = availableClasses;
    }
}

module.exports = {
    Student
}