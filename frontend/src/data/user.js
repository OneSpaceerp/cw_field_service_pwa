import { reactive } from "vue";
import { session } from "./session";

export const user = reactive({
	get email() {
		return session.user || "engineer@cwater.com";
	},
	get full_name() {
		return session.userFullName || "Eng. Ahmed Al-Mansoor";
	},
	get roles() {
		return ["CW Field Engineer"];
	},
});

export const userResource = reactive({
	get data() {
		return {
			email: user.email,
			name: user.full_name,
			roles: user.roles,
		};
	},
});
