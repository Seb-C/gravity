package main

import (
	"fmt"
	"math"
	"syscall/js"
	"time"
)

type Particle struct{
	X float64
	Y float64
}

func main() {
	particles := []Particle {
		{ 1, 2 },
		{ 3, 4 },
	}

	t1 := time.Now()
	var x Particle
	elapsedSeconds := 0.0435346
	var delta float64
	for i := float64(0); i < 1000000; i++ {
		x = Particle{ X: 0, Y: 0 }
		delta = 1.2 * elapsedSeconds * i
		x.X = delta * math.Cos(math.Pi * 2)
		x.Y = delta * math.Sin(math.Pi * 2)
		x.X = math.Sqrt(x.X)
	}
	t2 := time.Now()
	_ = x
	fmt.Println("go rand v2", t2.Sub(t1).Milliseconds(), "ms")

	// 22000 ms
	canvas := js.Global().Get("testcanvas")
	t1 = time.Now()
	for i := 0; i < 1000000; i++ {
		canvas.Set("fillStyle", "rgb(1, 2, 3)")
		canvas.Call("beginPath")
		canvas.Call("arc", 42, 56, 23, 0, 2 * math.Pi)
		canvas.Call("fill")
	}
	t2 = time.Now()
	fmt.Println("go draw", t2.Sub(t1).Milliseconds(), "ms")

	context := js.Global().Get("require").Invoke("engine/main").Get("default")

	context.Set("getParticles", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		out := make([]interface{}, 0, len(particles))
		for _, particle := range particles {
			out = append(out, map[string]interface{}{
				"x": particle.X,
				"y": particle.Y,
			})
		}

		return out
	}))

	for {
		time.Sleep(time.Hour)
	}
}
