import React from 'react'

const Flashcard = ({flashcard, onToggleStar}) => {
    const [isFlapped, setIsFlapped] = React.useState(false);
    const handleFlip = () => {
        setIsFlapped(!isFlapped);
    }
  return (
    <div>Flashcard</div>
  )
}

export default Flashcard