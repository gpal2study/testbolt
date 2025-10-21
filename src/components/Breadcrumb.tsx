interface BreadcrumbProps {
  currentPath: string;
}

export default function Breadcrumb({ currentPath }: BreadcrumbProps) {
  const getBreadcrumbText = (path: string) => {
    switch (path) {
      case '/':
        return 'Home';
      case '/doc-type-master':
        return 'Home / Document Type Master';
      default:
        return 'Home';
    }
  };

  return (
    <div className="breadcrumb">
      {getBreadcrumbText(currentPath)}
    </div>
  );
}
