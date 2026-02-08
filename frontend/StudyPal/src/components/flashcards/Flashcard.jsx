import React from 'react'

const Flashcard = ({flashcard, onToggle}) => {
    const [isFlapped, setIsFlapped] = React.useState(false);
    const handleFlip = () => {
        setIsFlapped(!isFlapped);
    }
  return (
    <div>Flashcard</div>
  )
}

export default Flashcard