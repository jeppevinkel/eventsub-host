import {Subscription} from "./subscription";

export interface Notification {
    subscription: Subscription
    event: object
}