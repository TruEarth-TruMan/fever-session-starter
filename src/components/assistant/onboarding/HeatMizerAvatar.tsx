
interface HeatMizerAvatarProps {
  size?: "sm" | "default";
}

const HeatMizerAvatar = ({ size = "default" }: HeatMizerAvatarProps) => {
  const dimensions = size === "sm" ? "w-6 h-6" : "w-16 h-16";
  const borderWidth = size === "sm" ? "border" : "border-2";
  
  return (
    <img 
      src="/lovable-uploads/1d643dd5-65c9-4d40-9bf8-09ea58c9055c.png" 
      alt="Heat Mizer" 
      className={`${dimensions} rounded-full ${borderWidth} border-fever-amber`} 
      draggable={false}
    />
  );
};

export default HeatMizerAvatar;
