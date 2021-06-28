import React from 'react';
import './subscription.scss';

export function CardDescription({ title, description }) {	
	return (
		<div className="card-description">
			<h2>{ title }</h2>
			<p>{ description }</p>
		</div>
	);
};

export function CardBilling({ price, recurrency }) {
	return (
		<div className="card-billing">
			<p>
				<strong className="price">$ { price }</strong>
                <strong> / mo.</strong>
			</p>
			<p>
				<span className="recurrency">
					Billed every month on your date of subscription.
				</span>
			</p>
		</div>
	);
};

export function CardFeatures({ children }) {	
	return (
		<div className="card-features">
			{children}
		</div>
	);
};

export function CardAction({children}) {
	return (
		<div className="pay">
            {children}
		</div>
	);
};
