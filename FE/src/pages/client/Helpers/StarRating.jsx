// Helpers/StarRating.jsx
const StarRating = ({ rating, ratingHandler, hoverRating, hoverHandler }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = hoverRating ? star <= hoverRating : star <= rating;
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => hoverHandler(star)}
            onMouseLeave={() => hoverHandler(0)}
            onClick={() => ratingHandler(star)}
            className="focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={isFilled ? "#FFA500" : "#ccc"}
              viewBox="0 0 24 24"
              stroke="none"
              className="w-6 h-6"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5.46 5.32L17.91 22 12 18.26 6.09 22l1.45-7.41L2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
