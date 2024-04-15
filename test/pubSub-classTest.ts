import { Susbscribable } from "./pubSub-Class";
import { Susbscribable2 } from "./pubSub-Class";

const sub = new Susbscribable2<string>();
sub.subscribe((msg) => {
    console.log( msg);
});

const unsub = sub.subscribe(console.log);
sub.publish("hello"); 
sub.publish( "hello1"); 
sub.publish( "hello3"); 
unsub();
sub.publish( "hello2"); 
