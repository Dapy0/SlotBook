import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserResponse } from "@slotbook/shared/user";
import { ArrowUp } from "lucide-react";

function ProfileMenu({
  user,
  profilePicture = "https://pixabay.com/vectors/blank-profile-picture-mystery-man-973460/",
  onLogout,
}: {
  user: UserResponse;
  profilePicture: string;
  onLogout: () => Promise<void>;
}) {
  const logOut = () => {
    onLogout();
  };
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={profilePicture} />
                <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent className="w-32">
          <DropdownMenuGroup>
            <DropdownMenuItem>My bookings</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={logOut} variant="destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ProfileMenu;
