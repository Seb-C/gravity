package main

import (
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
