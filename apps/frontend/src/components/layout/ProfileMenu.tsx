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
import type { AuthMeResponse, UserResponse } from "@slotbook/shared";
import { ArrowUp } from "lucide-react";
import Link from "next/link";

function ProfileMenu({
  me,
  profilePicture = "https://pixabay.com/vectors/blank-profile-picture-mystery-man-973460/",
  onLogout,
}: {
  me: AuthMeResponse;
  profilePicture: string;
  onLogout: () => Promise<void>;
}) {
  const logOut = () => {
    onLogout();
  };
  if (me == null) {
    return <></>;
  }
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={profilePicture} />
                <AvatarFallback>{me.user.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent className="w-32">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href={"/account/appointments"}>My bookings</Link>
            </DropdownMenuItem>
            {me.ownedFacilities.length > 0 && (
              <DropdownMenuItem>
                <Link href={"/dashboard"}> My venues</Link>
              </DropdownMenuItem>
            )}
            {me.staffMembership !== null && (
              <DropdownMenuItem>
                <Link href={"/work"}> Staff Panel</Link>
              </DropdownMenuItem>
            )}
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
