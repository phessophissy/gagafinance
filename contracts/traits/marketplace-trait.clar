;; Marketplace Trait
;; Interface for marketplace modules to implement

(define-trait marketplace-trait
  (
    ;; Check if marketplace is paused
    (is-paused () (response bool uint))
    
    ;; Get protocol fee in basis points
    (get-protocol-fee-bps () (response uint uint))
  )
)
