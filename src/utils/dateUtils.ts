export const formatDistanceToNow = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = date.getTime() - now.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMs < 0) {
    const pastDays = Math.abs(diffInDays);
    if (pastDays === 0) {
      return 'Hoje';
    } else if (pastDays === 1) {
      return 'Ontem';
    } else if (pastDays < 7) {
      return `${pastDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  } else {
    if (diffInDays === 0) {
      if (diffInHours === 0) {
        return 'Em alguns minutos';
      } else {
        return `Em ${diffInHours}h`;
      }
    } else if (diffInDays === 1) {
      return 'Amanhã';
    } else if (diffInDays < 7) {
      return `Em ${diffInDays} dias`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }
};