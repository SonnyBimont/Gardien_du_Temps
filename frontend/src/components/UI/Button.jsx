import React from "react";

const Button = ({
	children,
	onClick,
	variant = "primary",
	disabled = false,
	className = "",
}) => {
	const buttonClass =
		variant === "primary" ? "btn btn-primary" : "btn btn-outline";

	return (
		<button
			className={`${buttonClass} ${className}`}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	);
};

export default Button;
