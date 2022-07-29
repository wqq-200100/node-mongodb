let arr = [1,2,3]
let k = 0
const t = setInterval(()=>{
    console.log('这一次是', arr[k])
    k++
    if (k === arr.length ) clearInterval(t)
}, 1000)
