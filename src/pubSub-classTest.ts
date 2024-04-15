import { Susbscribable } from "./pubSub";

const sub = new Susbscribable<string>();
// sub.subscribe((msg) => {
//     console.log("1", msg);
// });
// const unsub = sub.subscribe((msg) => {
//     console.log("2", msg);
// });
// const unsub = sub.subscribe(console.log);
// sub.publish("hello"); 
// sub.publish("hello1"); 
// sub.publish("hello3"); 
// unsub();
// sub.publish("hello2"); 
