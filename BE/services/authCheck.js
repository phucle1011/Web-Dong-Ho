const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const checkJWT = (req, res, next) => {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Vui lòng đăng nhập!"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT Error:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token đã hết hạn, vui lòng đăng nhập lại!"
            });
        }

        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ!"
        });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Bạn không có quyền truy cập!"
        });
    }
    next();
};
module.exports = { checkJWT, isAdmin };
