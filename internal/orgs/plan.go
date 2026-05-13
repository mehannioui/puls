package orgs

// MaxServices returns the maximum number of monitored services allowed on the given plan.
func MaxServices(plan string) int {
	if plan == "pro" {
		return 50
	}
	return 3 // free
}

// MinInterval returns the minimum allowed check interval in seconds for the given plan.
func MinInterval(plan string) int {
	if plan == "pro" {
		return 60
	}
	return 300 // free
}
