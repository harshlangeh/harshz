// import { connect } from "./dbConfig";
// import { connect } from "./dbConfig/dbConfig";
import {connect} from "../../dbConfig/dbConfig.ts"

console.log(connect);

(async () => {
    try {
        await connect();
        console.log("Database connection test successful");
    } catch (error) {
        console.error("Database connection test failed:", error);
    }
})();
