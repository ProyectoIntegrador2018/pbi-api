exports.CONNECTION_URL = process.env.CONNECTION_URL || "mongodb://localhost:27017/pbidb";

exports.FRONT_URL = process.env.FRONT_URL || "localhost:8080";

exports.EMAIL = process.env.EMAIL || "emails@mail.com";

exports.KEY = process.env.KEY || "dummykey";

exports.SECRET = process.env.SECRET || "superSecret";

exports.MAIL_PORT = process.env.MAIL_PORT || 465;

exports.HOST = process.env.HOST || "smtp.mail.com";

exports.PORT = process.env.PORT || 3000;

exports.SECURE = process.env.SECURE || false;

exports.NEW_NUTRI_CODE = process.env.NUTRI_CODE || "secretToken";

exports.EXCEL_TEMPLATE = process.env.EXCEL_TEMPLATE || 'assets/excel.xlsx';
