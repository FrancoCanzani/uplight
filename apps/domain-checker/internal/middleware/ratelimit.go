package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type rateLimiter struct {
	requests map[string]*clientLimit
	mu       sync.RWMutex
	rate     int
	window   time.Duration
}

type clientLimit struct {
	count      int
	resetAt    time.Time
	domainLock map[string]time.Time
	mu         sync.Mutex
}

func NewRateLimiter(rate int, window time.Duration) gin.HandlerFunc {
	rl := &rateLimiter{
		requests: make(map[string]*clientLimit),
		rate:     rate,
		window:   window,
	}

	go func() {
		ticker := time.NewTicker(window)
		defer ticker.Stop()
		for range ticker.C {
			rl.cleanup()
		}
	}()

	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		domain := c.Query("url")

		if !rl.allow(clientIP, domain) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded, please try again later",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func (rl *rateLimiter) allow(clientIP, domain string) bool {
	rl.mu.Lock()
	client, exists := rl.requests[clientIP]
	if !exists {
		client = &clientLimit{
			count:      0,
			resetAt:    time.Now().Add(rl.window),
			domainLock: make(map[string]time.Time),
		}
		rl.requests[clientIP] = client
	}
	rl.mu.Unlock()

	client.mu.Lock()
	defer client.mu.Unlock()

	now := time.Now()

	if now.After(client.resetAt) {
		client.count = 0
		client.resetAt = now.Add(rl.window)
		client.domainLock = make(map[string]time.Time)
	}

	if client.count >= rl.rate {
		return false
	}

	if domain != "" {
		if lastRequest, exists := client.domainLock[domain]; exists {
			if time.Since(lastRequest) < 2*time.Second {
				return false
			}
		}
		client.domainLock[domain] = now
	}

	client.count++
	return true
}

func (rl *rateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for ip, client := range rl.requests {
		client.mu.Lock()
		if now.After(client.resetAt.Add(rl.window)) {
			delete(rl.requests, ip)
		}
		client.mu.Unlock()
	}
}
